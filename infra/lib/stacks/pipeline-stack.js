"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const codebuild = __importStar(require("aws-cdk-lib/aws-codebuild"));
const codepipeline = __importStar(require("aws-cdk-lib/aws-codepipeline"));
const pipelines = __importStar(require("aws-cdk-lib/pipelines"));
const frontend_stack_1 = require("./frontend-stack");
class PipelineStack extends cdk.Stack {
    pipeline;
    constructor(scope, id, props) {
        super(scope, id, props);
        const source = pipelines.CodePipelineSource.connection(props.repositoryName, props.branchName, {
            connectionArn: props.codeConnectionArn,
            triggerOnPush: true,
        });
        const synth = new pipelines.ShellStep("Synth", {
            input: source,
            commands: [
                "npm install",
                "npm run check --if-present",
                "npm run lint --if-present",
                "npm run test --if-present",
                "npm run build",
                "cd infra",
                "npm install",
                "npm run build",
                `npx -y cdk synth --context codeConnectionArn=${props.codeConnectionArn} --context repositoryName=${props.repositoryName} --context branchName=${props.branchName}`,
            ],
            primaryOutputDirectory: "infra/cdk.out",
        });
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
        // Production deployment stage
        const deployStage = new cdk.Stage(this, "Deploy", {
            env: { account: this.account, region: this.region },
        });
        new frontend_stack_1.FrontendStack(deployStage, "SwyxkitFrontend-prod", {
            stackName: "SwyxkitFrontend-prod",
            environment: "prod",
            buildOutputPath: "../.svelte-kit/output/client",
        });
        this.pipeline.addStage(deployStage);
        cdk.Tags.of(this).add("Stack", "Pipeline");
        cdk.Tags.of(this).add("aws-mcp:deploy:sop", "setup-codepipeline");
        new cdk.CfnOutput(this, "PipelineName", {
            value: "SwyxkitPipeline",
            description: "CodePipeline Name",
            exportName: "SwyxkitPipelineName",
        });
    }
}
exports.PipelineStack = PipelineStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMscUVBQXVEO0FBQ3ZELDJFQUE2RDtBQUM3RCxpRUFBbUQ7QUFFbkQscURBQWlEO0FBUWpELE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFCLFFBQVEsQ0FBeUI7SUFFakQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUNqRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUNwRCxLQUFLLENBQUMsY0FBYyxFQUNwQixLQUFLLENBQUMsVUFBVSxFQUNoQjtZQUNFLGFBQWEsRUFBRSxLQUFLLENBQUMsaUJBQWlCO1lBQ3RDLGFBQWEsRUFBRSxJQUFJO1NBQ3BCLENBQ0YsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDN0MsS0FBSyxFQUFFLE1BQU07WUFDYixRQUFRLEVBQUU7Z0JBQ1IsYUFBYTtnQkFDYiw0QkFBNEI7Z0JBQzVCLDJCQUEyQjtnQkFDM0IsMkJBQTJCO2dCQUMzQixlQUFlO2dCQUNmLFVBQVU7Z0JBQ1YsYUFBYTtnQkFDYixlQUFlO2dCQUNmLGdEQUFnRCxLQUFLLENBQUMsaUJBQWlCLDZCQUE2QixLQUFLLENBQUMsY0FBYyx5QkFBeUIsS0FBSyxDQUFDLFVBQVUsRUFBRTthQUNwSztZQUNELHNCQUFzQixFQUFFLGVBQWU7U0FDeEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUMzRCxZQUFZLEVBQUUsaUJBQWlCO1lBQy9CLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFlBQVksRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDMUMsS0FBSztZQUNMLHNCQUFzQixFQUFFO2dCQUN0QixnQkFBZ0IsRUFBRTtvQkFDaEIsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTTtvQkFDekMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUMsWUFBWTtpQkFDbkQ7Z0JBQ0QsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7b0JBQy9DLE9BQU8sRUFBRSxLQUFLO29CQUNkLE1BQU0sRUFBRTt3QkFDTixPQUFPLEVBQUU7NEJBQ1Asa0JBQWtCLEVBQUU7Z0NBQ2xCLE1BQU0sRUFBRSxRQUFROzZCQUNqQjt5QkFDRjtxQkFDRjtpQkFDRixDQUFDO2FBQ0g7U0FDRixDQUFDLENBQUM7UUFFSCw4QkFBOEI7UUFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDaEQsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7U0FDcEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSw4QkFBYSxDQUFDLFdBQVcsRUFBRSxzQkFBc0IsRUFBRTtZQUNyRCxTQUFTLEVBQUUsc0JBQXNCO1lBQ2pDLFdBQVcsRUFBRSxNQUFNO1lBQ25CLGVBQWUsRUFBRSw4QkFBOEI7U0FDaEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFcEMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMzQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUVsRSxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUN0QyxLQUFLLEVBQUUsaUJBQWlCO1lBQ3hCLFdBQVcsRUFBRSxtQkFBbUI7WUFDaEMsVUFBVSxFQUFFLHFCQUFxQjtTQUNsQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE1RUQsc0NBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgY29kZWJ1aWxkIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZWJ1aWxkXCI7XG5pbXBvcnQgKiBhcyBjb2RlcGlwZWxpbmUgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmVcIjtcbmltcG9ydCAqIGFzIHBpcGVsaW5lcyBmcm9tIFwiYXdzLWNkay1saWIvcGlwZWxpbmVzXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgRnJvbnRlbmRTdGFjayB9IGZyb20gXCIuL2Zyb250ZW5kLXN0YWNrXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGlwZWxpbmVTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBjb2RlQ29ubmVjdGlvbkFybjogc3RyaW5nO1xuICByZXBvc2l0b3J5TmFtZTogc3RyaW5nO1xuICBicmFuY2hOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBQaXBlbGluZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IHBpcGVsaW5lOiBwaXBlbGluZXMuQ29kZVBpcGVsaW5lO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBQaXBlbGluZVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHNvdXJjZSA9IHBpcGVsaW5lcy5Db2RlUGlwZWxpbmVTb3VyY2UuY29ubmVjdGlvbihcbiAgICAgIHByb3BzLnJlcG9zaXRvcnlOYW1lLFxuICAgICAgcHJvcHMuYnJhbmNoTmFtZSxcbiAgICAgIHtcbiAgICAgICAgY29ubmVjdGlvbkFybjogcHJvcHMuY29kZUNvbm5lY3Rpb25Bcm4sXG4gICAgICAgIHRyaWdnZXJPblB1c2g6IHRydWUsXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IHN5bnRoID0gbmV3IHBpcGVsaW5lcy5TaGVsbFN0ZXAoXCJTeW50aFwiLCB7XG4gICAgICBpbnB1dDogc291cmNlLFxuICAgICAgY29tbWFuZHM6IFtcbiAgICAgICAgXCJucG0gaW5zdGFsbFwiLFxuICAgICAgICBcIm5wbSBydW4gY2hlY2sgLS1pZi1wcmVzZW50XCIsXG4gICAgICAgIFwibnBtIHJ1biBsaW50IC0taWYtcHJlc2VudFwiLFxuICAgICAgICBcIm5wbSBydW4gdGVzdCAtLWlmLXByZXNlbnRcIixcbiAgICAgICAgXCJucG0gcnVuIGJ1aWxkXCIsXG4gICAgICAgIFwiY2QgaW5mcmFcIixcbiAgICAgICAgXCJucG0gaW5zdGFsbFwiLFxuICAgICAgICBcIm5wbSBydW4gYnVpbGRcIixcbiAgICAgICAgYG5weCAteSBjZGsgc3ludGggLS1jb250ZXh0IGNvZGVDb25uZWN0aW9uQXJuPSR7cHJvcHMuY29kZUNvbm5lY3Rpb25Bcm59IC0tY29udGV4dCByZXBvc2l0b3J5TmFtZT0ke3Byb3BzLnJlcG9zaXRvcnlOYW1lfSAtLWNvbnRleHQgYnJhbmNoTmFtZT0ke3Byb3BzLmJyYW5jaE5hbWV9YCxcbiAgICAgIF0sXG4gICAgICBwcmltYXJ5T3V0cHV0RGlyZWN0b3J5OiBcImluZnJhL2Nkay5vdXRcIixcbiAgICB9KTtcblxuICAgIHRoaXMucGlwZWxpbmUgPSBuZXcgcGlwZWxpbmVzLkNvZGVQaXBlbGluZSh0aGlzLCBcIlBpcGVsaW5lXCIsIHtcbiAgICAgIHBpcGVsaW5lTmFtZTogXCJTd3l4a2l0UGlwZWxpbmVcIixcbiAgICAgIHNlbGZNdXRhdGlvbjogdHJ1ZSxcbiAgICAgIHBpcGVsaW5lVHlwZTogY29kZXBpcGVsaW5lLlBpcGVsaW5lVHlwZS5WMixcbiAgICAgIHN5bnRoLFxuICAgICAgc3ludGhDb2RlQnVpbGREZWZhdWx0czoge1xuICAgICAgICBidWlsZEVudmlyb25tZW50OiB7XG4gICAgICAgICAgY29tcHV0ZVR5cGU6IGNvZGVidWlsZC5Db21wdXRlVHlwZS5NRURJVU0sXG4gICAgICAgICAgYnVpbGRJbWFnZTogY29kZWJ1aWxkLkxpbnV4QnVpbGRJbWFnZS5TVEFOREFSRF83XzAsXG4gICAgICAgIH0sXG4gICAgICAgIHBhcnRpYWxCdWlsZFNwZWM6IGNvZGVidWlsZC5CdWlsZFNwZWMuZnJvbU9iamVjdCh7XG4gICAgICAgICAgdmVyc2lvbjogXCIwLjJcIixcbiAgICAgICAgICBwaGFzZXM6IHtcbiAgICAgICAgICAgIGluc3RhbGw6IHtcbiAgICAgICAgICAgICAgXCJydW50aW1lLXZlcnNpb25zXCI6IHtcbiAgICAgICAgICAgICAgICBub2RlanM6IFwibGF0ZXN0XCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIFByb2R1Y3Rpb24gZGVwbG95bWVudCBzdGFnZVxuICAgIGNvbnN0IGRlcGxveVN0YWdlID0gbmV3IGNkay5TdGFnZSh0aGlzLCBcIkRlcGxveVwiLCB7XG4gICAgICBlbnY6IHsgYWNjb3VudDogdGhpcy5hY2NvdW50LCByZWdpb246IHRoaXMucmVnaW9uIH0sXG4gICAgfSk7XG5cbiAgICBuZXcgRnJvbnRlbmRTdGFjayhkZXBsb3lTdGFnZSwgXCJTd3l4a2l0RnJvbnRlbmQtcHJvZFwiLCB7XG4gICAgICBzdGFja05hbWU6IFwiU3d5eGtpdEZyb250ZW5kLXByb2RcIixcbiAgICAgIGVudmlyb25tZW50OiBcInByb2RcIixcbiAgICAgIGJ1aWxkT3V0cHV0UGF0aDogXCIuLi8uc3ZlbHRlLWtpdC9vdXRwdXQvY2xpZW50XCIsXG4gICAgfSk7XG5cbiAgICB0aGlzLnBpcGVsaW5lLmFkZFN0YWdlKGRlcGxveVN0YWdlKTtcblxuICAgIGNkay5UYWdzLm9mKHRoaXMpLmFkZChcIlN0YWNrXCIsIFwiUGlwZWxpbmVcIik7XG4gICAgY2RrLlRhZ3Mub2YodGhpcykuYWRkKFwiYXdzLW1jcDpkZXBsb3k6c29wXCIsIFwic2V0dXAtY29kZXBpcGVsaW5lXCIpO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJQaXBlbGluZU5hbWVcIiwge1xuICAgICAgdmFsdWU6IFwiU3d5eGtpdFBpcGVsaW5lXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJDb2RlUGlwZWxpbmUgTmFtZVwiLFxuICAgICAgZXhwb3J0TmFtZTogXCJTd3l4a2l0UGlwZWxpbmVOYW1lXCIsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==