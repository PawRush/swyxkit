import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";

/**
 * CodeBuildRole - IAM role for CodeBuild projects with fine-grained permissions
 */
export class CodeBuildRole extends Construct {
  public readonly role: iam.Role;

  constructor(
    scope: Construct,
    id: string,
    props: {
      allowSecretsManager?: boolean;
      allowS3Artifacts?: boolean;
      allowCloudFormation?: boolean;
      allowCdkBootstrap?: boolean;
      additionalPolicies?: iam.PolicyStatement[];
    } = {},
  ) {
    super(scope, id);

    this.role = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      description: `CodeBuild role for ${id}`,
    });

    // CloudWatch Logs - always needed
    this.role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["arn:aws:logs:*:*:log-group:/aws/codebuild/*"],
      }),
    );

    // S3 Artifacts
    if (props.allowS3Artifacts) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:ListBucket",
            "s3:GetBucketLocation",
          ],
          resources: [
            "arn:aws:s3:::*-pipeline-artifacts-*",
            "arn:aws:s3:::*-pipeline-artifacts-*/*",
          ],
        }),
      );
    }

    // Secrets Manager
    if (props.allowSecretsManager) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["secretsmanager:GetSecretValue"],
          resources: ["arn:aws:secretsmanager:*:*:secret:*"],
        }),
      );
    }

    // CloudFormation
    if (props.allowCloudFormation) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudformation:DescribeStacks",
            "cloudformation:DescribeStackResources",
            "cloudformation:DescribeStackEvents",
          ],
          resources: ["*"],
        }),
      );
    }

    // CDK Bootstrap (required for cdk synth/deploy)
    if (props.allowCdkBootstrap) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:GetObject",
            "s3:GetBucketVersioning",
            "s3:ListBucketVersions",
            "s3:ListBucket",
          ],
          resources: [
            "arn:aws:s3:::cdk-*-assets-*",
            "arn:aws:s3:::cdk-*-assets-*/*",
          ],
        }),
      );

      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ecr:DescribeRepositories",
            "ecr:GetDownloadUrlForLayer",
            "ecr:ListImages",
          ],
          resources: [
            "arn:aws:ecr:*:*:repository/cdk-*",
            "arn:aws:ecr:*:*:repository/aws-cdk/*",
          ],
        }),
      );
    }

    // Additional custom policies
    if (props.additionalPolicies) {
      props.additionalPolicies.forEach((policy) => {
        this.role.addToPrincipalPolicy(policy);
      });
    }
  }
}

/**
 * ArtifactsBucket - S3 bucket for pipeline artifacts with lifecycle rules
 */
export class ArtifactsBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(
    scope: Construct,
    id: string,
    props: { appName?: string } = {},
  ) {
    super(scope, id);

    const account = cdk.Stack.of(this).account;
    const appName = props.appName || "app";

    this.bucket = new s3.Bucket(this, "Bucket", {
      bucketName: `${appName}-pipeline-artifacts-${account}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [
        {
          id: "DeleteOldArtifacts",
          noncurrentVersionExpiration: cdk.Duration.days(30),
          expiration: cdk.Duration.days(30),
        },
        {
          id: "AbortIncompleteMultipartUploads",
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
      serverAccessLogsPrefix: "logs/",
    });
  }
}

/**
 * LambdaAlarms - CloudWatch alarms for Lambda monitoring
 */
export class LambdaAlarms extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: { functionName: string; snsTopicArn?: string } = {
      functionName: "",
    },
  ) {
    super(scope, id);

    // Duration alarm
    new cloudwatch.Alarm(this, "DurationAlarm", {
      metric: new cloudwatch.Metric({
        namespace: "AWS/Lambda",
        metricName: "Duration",
        dimensionsMap: {
          FunctionName: props.functionName,
        },
        statistic: "Average",
      }),
      threshold: 30000, // 30 seconds
      evaluationPeriods: 1,
      alarmDescription: `Lambda ${props.functionName} exceeds 30s average duration`,
    });

    // Error rate alarm
    new cloudwatch.Alarm(this, "ErrorRateAlarm", {
      metric: new cloudwatch.Metric({
        namespace: "AWS/Lambda",
        metricName: "Errors",
        dimensionsMap: {
          FunctionName: props.functionName,
        },
        statistic: "Sum",
      }),
      threshold: 10,
      evaluationPeriods: 5,
      alarmDescription: `Lambda ${props.functionName} error rate spike`,
    });

    // Throttle alarm
    new cloudwatch.Alarm(this, "ThrottleAlarm", {
      metric: new cloudwatch.Metric({
        namespace: "AWS/Lambda",
        metricName: "Throttles",
        dimensionsMap: {
          FunctionName: props.functionName,
        },
        statistic: "Sum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: `Lambda ${props.functionName} throttled`,
    });
  }
}

/**
 * EnvironmentSecrets - Secrets Manager integration for environment-specific secrets
 */
export class EnvironmentSecrets extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: { appName: string; environment: string } = { appName: "", environment: "prod" },
  ) {
    super(scope, id);

    const secretId = `${props.appName}/${props.environment}/secrets`;

    new cdk.CfnOutput(this, "SecretsId", {
      value: secretId,
      description: `Secrets Manager secret ID for ${props.environment}`,
    });
  }
}
