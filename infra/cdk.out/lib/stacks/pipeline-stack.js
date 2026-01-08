import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as pipelines from "aws-cdk-lib/pipelines";
import { FrontendStack } from "./frontend-stack";
export class PipelineStack extends cdk.Stack {
    pipeline;
    constructor(scope, id, props) {
        super(scope, id, props);
        const source = pipelines.CodePipelineSource.connection(props.repositoryName, props.branchName, {
            connectionArn: props.codeConnectionArn,
            triggerOnPush: true,
        });
        // Synth step with quality checks
        const synth = new pipelines.ShellStep("Synth", {
            input: source,
            commands: [
                // Install dependencies
                "npm ci",
                // Quality checks
                "npm run lint",
                "npm run test",
                "npx -y @secretlint/quick-start '**/*'",
                // Build frontend
                "npm run build",
                // Build and synth CDK
                "cd infra && npm ci",
                "npm run build",
                // Note: Context params required for self-mutation to work correctly
                `npx -y cdk synth --context codeConnectionArn=${props.codeConnectionArn} --context repositoryName=${props.repositoryName} --context branchName=${props.branchName}`,
            ],
            primaryOutputDirectory: "infra/cdk.out",
        });
        // Create self-mutating pipeline
        this.pipeline = new pipelines.CodePipeline(this, "Pipeline", {
            pipelineName: "SwyxkitPipeline",
            selfMutation: true,
            pipelineType: codepipeline.PipelineType.V2,
            synth,
            synthCodeBuildDefaults: {
                buildEnvironment: {
                    computeType: codebuild.ComputeType.MEDIUM,
                    buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
                },
                partialBuildSpec: codebuild.BuildSpec.fromObject({
                    version: "0.2",
                    phases: {
                        install: {
                            "runtime-versions": {
                                nodejs: "latest",
                            },
                        },
                    },
                }),
            },
        });
        // Deploy stage
        const deployStage = new cdk.Stage(this, "Deploy", {
            env: { account: this.account, region: this.region },
        });
        new FrontendStack(deployStage, "SwyxkitFrontend-prod", {
            environment: "prod",
            buildOutputPath: "../dist",
        });
        this.pipeline.addStage(deployStage);
        // Tags
        cdk.Tags.of(this).add("Stack", "Pipeline");
        cdk.Tags.of(this).add("aws-mcp:deploy:type", "ci-cd");
        // Outputs
        new cdk.CfnOutput(this, "PipelineName", {
            value: "SwyxkitPipeline",
            description: "CodePipeline Name",
        });
    }
}
