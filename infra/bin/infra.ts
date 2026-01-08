#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/stacks/frontend-stack";
import { PipelineStack } from "../lib/stacks/pipeline-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || "us-east-1";

// Context values
const codeConnectionArn = app.node.tryGetContext("codeConnectionArn");
const repositoryName =
  app.node.tryGetContext("repositoryName") || "PawRush/swyxkit";
const branchName = app.node.tryGetContext("branchName") || "main";

// Deploy Frontend stack directly (for local dev or preview environments)
if (!codeConnectionArn) {
  new FrontendStack(app, "SwyxkitFrontendDev", {
    env: { account, region },
    description: "Swyxkit Frontend - Development",
    environment: "dev",
    buildOutputPath: "../dist",
  });
}

// Deploy Pipeline (when codeConnectionArn is provided)
if (codeConnectionArn) {
  new PipelineStack(app, "SwyxkitPipelineStack", {
    env: { account, region },
    description: "CI/CD Pipeline for Swyxkit",
    codeConnectionArn,
    repositoryName,
    branchName,
    terminationProtection: true,
  });
}

// Global tags
cdk.Tags.of(app).add("Project", "Swyxkit");
cdk.Tags.of(app).add("ManagedBy", "CDK");
