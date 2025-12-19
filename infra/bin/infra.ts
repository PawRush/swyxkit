#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { execSync } from "child_process";
import { FrontendStack } from "../lib/stacks/frontend-stack";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();

// Get context values
const codeConnectionArn = app.node.tryGetContext("codeConnectionArn");
const repositoryName =
  app.node.tryGetContext("repositoryName") || "your-org/your-repo";
const branchName = app.node.tryGetContext("branchName") || "main";
const pipelineOnly = app.node.tryGetContext("pipelineOnly") === "true";

// Environment detection
const getDefaultEnvironment = (): string => {
  try {
    const username = process.env.USER || execSync('whoami').toString().trim();
    return `preview-${username}`;
  } catch {
    return 'preview-local';
  }
};

const environment = app.node.tryGetContext("environment") || getDefaultEnvironment();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || "us-east-1";

// Build output path for SvelteKit
const buildOutputPath = app.node.tryGetContext("buildPath") || "../.svelte-kit/output/client";

// Create infrastructure stacks only if not pipeline-only mode
if (!pipelineOnly) {
  new FrontendStack(app, `SwyxkitFrontend-${environment}`, {
    env: { account, region },
    environment,
    buildOutputPath,
    description: `Swyxkit static website hosting - ${environment}`,
  });
}

// Create pipeline stack (only if CodeConnection ARN is provided)
if (codeConnectionArn) {
  new PipelineStack(app, "SwyxkitPipelineStack", {
    env: { account, region },
    description: "CI/CD Pipeline for Swyxkit",
    codeConnectionArn,
    repositoryName,
    branchName,
  });
} else if (pipelineOnly) {
  console.warn(
    "⚠️  CodeConnection ARN not provided. Pipeline stack will not be created.",
  );
  console.warn("   Provide context: cdk deploy --context codeConnectionArn=ARN");
}

// Global tags
cdk.Tags.of(app).add("Project", "Swyxkit");
cdk.Tags.of(app).add("ManagedBy", "CDK");
cdk.Tags.of(app).add("Environment", environment);
