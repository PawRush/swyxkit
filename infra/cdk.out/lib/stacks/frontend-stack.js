import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
export class FrontendStack extends cdk.Stack {
    bucket;
    distribution;
    constructor(scope, id, props) {
        super(scope, id, props);
        const env = props?.environment || "dev";
        const buildPath = props?.buildOutputPath || path.join(__dirname, "../../dist");
        // S3 bucket for website content
        this.bucket = new s3.Bucket(this, "WebsiteBucket", {
            bucketName: `swyxkit-${env}-${cdk.Stack.of(this).account}`,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });
        // CloudFront OAI for S3 access
        const oai = new cloudfront.OriginAccessIdentity(this, "OAI", {
            comment: `OAI for ${id}`,
        });
        this.bucket.grantRead(oai);
        // CloudFront distribution
        this.distribution = new cloudfront.CloudFrontWebDistribution(this, "Distribution", {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.bucket,
                        originAccessIdentity: oai,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                            compress: true,
                            forwardedValues: {
                                queryString: true,
                            },
                            defaultTtl: cdk.Duration.days(1),
                            maxTtl: cdk.Duration.days(365),
                        },
                    ],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                    errorCachingMinTtl: 0,
                },
                {
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                    errorCachingMinTtl: 0,
                },
            ],
        });
        // Deploy website files
        new s3deploy.BucketDeployment(this, "Deployment", {
            sources: [s3deploy.Source.asset(buildPath)],
            destinationBucket: this.bucket,
            distribution: this.distribution,
            distributionPaths: ["/*"],
        });
        // Outputs
        new cdk.CfnOutput(this, "BucketName", {
            value: this.bucket.bucketName,
            description: "S3 Bucket Name",
        });
        new cdk.CfnOutput(this, "DistributionURL", {
            value: `https://${this.distribution.distributionDomainName}`,
            description: "CloudFront Distribution URL",
        });
        new cdk.CfnOutput(this, "DistributionId", {
            value: this.distribution.distributionId,
            description: "CloudFront Distribution ID",
        });
        // Tags
        cdk.Tags.of(this).add("Stack", "Frontend");
        cdk.Tags.of(this).add("Environment", env);
    }
}
