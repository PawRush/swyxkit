import * as cdk from "aws-cdk-lib";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
export interface PipelineStackProps extends cdk.StackProps {
    codeConnectionArn: string;
    repositoryName: string;
    branchName: string;
}
export declare class PipelineStack extends cdk.Stack {
    readonly pipeline: pipelines.CodePipeline;
    constructor(scope: Construct, id: string, props: PipelineStackProps);
}
