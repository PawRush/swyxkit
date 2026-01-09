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
exports.FrontendStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const s3deploy = __importStar(require("aws-cdk-lib/aws-s3-deployment"));
const aws_cloudfront_s3_1 = require("@aws-solutions-constructs/aws-cloudfront-s3");
class FrontendStack extends cdk.Stack {
    distributionDomainName;
    bucketName;
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment, buildOutputPath } = props;
        const isProd = environment === "prod";
        const removalPolicy = isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
        // Create CloudFront + S3 distribution using AWS Solutions Constructs
        const cloudfrontToS3 = new aws_cloudfront_s3_1.CloudFrontToS3(this, "CFToS3", {
            bucketProps: {
                removalPolicy,
                autoDeleteObjects: !isProd,
                versioned: false,
            },
            loggingBucketProps: {
                removalPolicy,
                autoDeleteObjects: !isProd,
                lifecycleRules: [
                    {
                        id: "DeleteOldLogs",
                        enabled: true,
                        expiration: isProd ? cdk.Duration.days(3650) : cdk.Duration.days(7),
                    },
                ],
            },
            cloudFrontLoggingBucketProps: {
                removalPolicy,
                autoDeleteObjects: !isProd,
                lifecycleRules: [
                    {
                        id: "DeleteOldLogs",
                        enabled: true,
                        expiration: isProd ? cdk.Duration.days(3650) : cdk.Duration.days(7),
                    },
                ],
            },
            insertHttpSecurityHeaders: true,
            cloudFrontDistributionProps: {
                comment: `${id} - ${environment}`,
                defaultRootObject: "index.html",
                priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
                enableIpv6: true,
                httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
                minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
                defaultBehavior: {
                    functionAssociations: [
                        {
                            function: new cloudfront.Function(this, "UrlRewriteFunction", {
                                code: cloudfront.FunctionCode.fromInline(`
                  function handler(event) {
                    const request = event.request;
                    let uri = request.uri;
                    if (!uri.includes('.')) {
                      if (!uri.endsWith('/')) uri += '/';
                      request.uri = uri + 'index.html';
                    }
                    return request;
                  }
                `),
                                comment: "Rewrites /path to /path/index.html",
                            }),
                            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                        },
                    ],
                },
            },
        });
        const websiteBucket = cloudfrontToS3.s3Bucket;
        const distribution = cloudfrontToS3.cloudFrontWebDistribution;
        const withAssets = this.node.tryGetContext("withAssets") !== "false";
        if (withAssets) {
            new s3deploy.BucketDeployment(this, "DeployWebsite", {
                sources: [s3deploy.Source.asset(buildOutputPath)],
                destinationBucket: websiteBucket,
                distribution,
                distributionPaths: ["/*"],
                prune: true,
                memoryLimit: 512,
            });
        }
        this.distributionDomainName = distribution.distributionDomainName;
        this.bucketName = websiteBucket.bucketName;
        // Outputs
        new cdk.CfnOutput(this, "WebsiteURL", {
            value: `https://${distribution.distributionDomainName}`,
            description: "CloudFront distribution URL",
            exportName: `${id}-WebsiteURL`,
        });
        new cdk.CfnOutput(this, "BucketName", {
            value: websiteBucket.bucketName,
            description: "S3 bucket name",
            exportName: `${id}-BucketName`,
        });
        new cdk.CfnOutput(this, "DistributionId", {
            value: distribution.distributionId,
            description: "CloudFront distribution ID",
            exportName: `${id}-DistributionId`,
        });
        new cdk.CfnOutput(this, "DistributionDomainName", {
            value: distribution.distributionDomainName,
            description: "CloudFront domain name",
            exportName: `${id}-DistributionDomain`,
        });
        if (cloudfrontToS3.s3LoggingBucket) {
            new cdk.CfnOutput(this, "S3LogBucketName", {
                value: cloudfrontToS3.s3LoggingBucket.bucketName,
                description: "Bucket for S3 access logs",
                exportName: `${id}-S3LogBucket`,
            });
        }
        if (cloudfrontToS3.cloudFrontLoggingBucket) {
            new cdk.CfnOutput(this, "CloudFrontLogBucketName", {
                value: cloudfrontToS3.cloudFrontLoggingBucket.bucketName,
                description: "Bucket for CloudFront access logs",
                exportName: `${id}-CloudFrontLogBucket`,
            });
        }
        cdk.Tags.of(this).add("Stack", "Frontend");
        cdk.Tags.of(this).add("aws-mcp:deploy:sop", "deploy-frontend-app");
    }
}
exports.FrontendStack = FrontendStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbnRlbmQtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmcm9udGVuZC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsdUVBQXlEO0FBQ3pELHdFQUEwRDtBQUMxRCxtRkFBNkU7QUFRN0UsTUFBYSxhQUFjLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDMUIsc0JBQXNCLENBQVM7SUFDL0IsVUFBVSxDQUFTO0lBRW5DLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBeUI7UUFDakUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsTUFBTSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDL0MsTUFBTSxNQUFNLEdBQUcsV0FBVyxLQUFLLE1BQU0sQ0FBQztRQUN0QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztRQUVwRixxRUFBcUU7UUFDckUsTUFBTSxjQUFjLEdBQUcsSUFBSSxrQ0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDeEQsV0FBVyxFQUFFO2dCQUNYLGFBQWE7Z0JBQ2IsaUJBQWlCLEVBQUUsQ0FBQyxNQUFNO2dCQUMxQixTQUFTLEVBQUUsS0FBSzthQUNqQjtZQUNELGtCQUFrQixFQUFFO2dCQUNsQixhQUFhO2dCQUNiLGlCQUFpQixFQUFFLENBQUMsTUFBTTtnQkFDMUIsY0FBYyxFQUFFO29CQUNkO3dCQUNFLEVBQUUsRUFBRSxlQUFlO3dCQUNuQixPQUFPLEVBQUUsSUFBSTt3QkFDYixVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FB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QUF0SUQsc0NBc0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnRcIjtcbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudFwiO1xuaW1wb3J0IHsgQ2xvdWRGcm9udFRvUzMgfSBmcm9tIFwiQGF3cy1zb2x1dGlvbnMtY29uc3RydWN0cy9hd3MtY2xvdWRmcm9udC1zM1wiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBGcm9udGVuZFN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIGJ1aWxkT3V0cHV0UGF0aDogc3RyaW5nOyAvLyBlLmcuLCBcIi4uLy5zdmVsdGUta2l0L291dHB1dC9jbGllbnRcIlxufVxuXG5leHBvcnQgY2xhc3MgRnJvbnRlbmRTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBkaXN0cmlidXRpb25Eb21haW5OYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSBidWNrZXROYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEZyb250ZW5kU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgeyBlbnZpcm9ubWVudCwgYnVpbGRPdXRwdXRQYXRoIH0gPSBwcm9wcztcbiAgICBjb25zdCBpc1Byb2QgPSBlbnZpcm9ubWVudCA9PT0gXCJwcm9kXCI7XG4gICAgY29uc3QgcmVtb3ZhbFBvbGljeSA9IGlzUHJvZCA/IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTiA6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1k7XG5cbiAgICAvLyBDcmVhdGUgQ2xvdWRGcm9udCArIFMzIGRpc3RyaWJ1dGlvbiB1c2luZyBBV1MgU29sdXRpb25zIENvbnN0cnVjdHNcbiAgICBjb25zdCBjbG91ZGZyb250VG9TMyA9IG5ldyBDbG91ZEZyb250VG9TMyh0aGlzLCBcIkNGVG9TM1wiLCB7XG4gICAgICBidWNrZXRQcm9wczoge1xuICAgICAgICByZW1vdmFsUG9saWN5LFxuICAgICAgICBhdXRvRGVsZXRlT2JqZWN0czogIWlzUHJvZCxcbiAgICAgICAgdmVyc2lvbmVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBsb2dnaW5nQnVja2V0UHJvcHM6IHtcbiAgICAgICAgcmVtb3ZhbFBvbGljeSxcbiAgICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6ICFpc1Byb2QsXG4gICAgICAgIGxpZmVjeWNsZVJ1bGVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgaWQ6IFwiRGVsZXRlT2xkTG9nc1wiLFxuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGV4cGlyYXRpb246IGlzUHJvZCA/IGNkay5EdXJhdGlvbi5kYXlzKDM2NTApIDogY2RrLkR1cmF0aW9uLmRheXMoNyksXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBjbG91ZEZyb250TG9nZ2luZ0J1Y2tldFByb3BzOiB7XG4gICAgICAgIHJlbW92YWxQb2xpY3ksXG4gICAgICAgIGF1dG9EZWxldGVPYmplY3RzOiAhaXNQcm9kLFxuICAgICAgICBsaWZlY3ljbGVSdWxlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiBcIkRlbGV0ZU9sZExvZ3NcIixcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBleHBpcmF0aW9uOiBpc1Byb2QgPyBjZGsuRHVyYXRpb24uZGF5cygzNjUwKSA6IGNkay5EdXJhdGlvbi5kYXlzKDcpLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgaW5zZXJ0SHR0cFNlY3VyaXR5SGVhZGVyczogdHJ1ZSxcbiAgICAgIGNsb3VkRnJvbnREaXN0cmlidXRpb25Qcm9wczoge1xuICAgICAgICBjb21tZW50OiBgJHtpZH0gLSAke2Vudmlyb25tZW50fWAsXG4gICAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBcImluZGV4Lmh0bWxcIixcbiAgICAgICAgcHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTXzEwMCxcbiAgICAgICAgZW5hYmxlSXB2NjogdHJ1ZSxcbiAgICAgICAgaHR0cFZlcnNpb246IGNsb3VkZnJvbnQuSHR0cFZlcnNpb24uSFRUUDJfQU5EXzMsXG4gICAgICAgIG1pbmltdW1Qcm90b2NvbFZlcnNpb246IGNsb3VkZnJvbnQuU2VjdXJpdHlQb2xpY3lQcm90b2NvbC5UTFNfVjFfMl8yMDIxLFxuICAgICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgICBmdW5jdGlvbkFzc29jaWF0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBmdW5jdGlvbjogbmV3IGNsb3VkZnJvbnQuRnVuY3Rpb24odGhpcywgXCJVcmxSZXdyaXRlRnVuY3Rpb25cIiwge1xuICAgICAgICAgICAgICAgIGNvZGU6IGNsb3VkZnJvbnQuRnVuY3Rpb25Db2RlLmZyb21JbmxpbmUoYFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gaGFuZGxlcihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gZXZlbnQucmVxdWVzdDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVyaSA9IHJlcXVlc3QudXJpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVyaS5pbmNsdWRlcygnLicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKCF1cmkuZW5kc1dpdGgoJy8nKSkgdXJpICs9ICcvJztcbiAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LnVyaSA9IHVyaSArICdpbmRleC5odG1sJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBgKSxcbiAgICAgICAgICAgICAgICBjb21tZW50OiBcIlJld3JpdGVzIC9wYXRoIHRvIC9wYXRoL2luZGV4Lmh0bWxcIixcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGV2ZW50VHlwZTogY2xvdWRmcm9udC5GdW5jdGlvbkV2ZW50VHlwZS5WSUVXRVJfUkVRVUVTVCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCB3ZWJzaXRlQnVja2V0ID0gY2xvdWRmcm9udFRvUzMuczNCdWNrZXQhO1xuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IGNsb3VkZnJvbnRUb1MzLmNsb3VkRnJvbnRXZWJEaXN0cmlidXRpb247XG5cbiAgICBjb25zdCB3aXRoQXNzZXRzID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoXCJ3aXRoQXNzZXRzXCIpICE9PSBcImZhbHNlXCI7XG4gICAgaWYgKHdpdGhBc3NldHMpIHtcbiAgICAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsIFwiRGVwbG95V2Vic2l0ZVwiLCB7XG4gICAgICAgIHNvdXJjZXM6IFtzM2RlcGxveS5Tb3VyY2UuYXNzZXQoYnVpbGRPdXRwdXRQYXRoKV0sXG4gICAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB3ZWJzaXRlQnVja2V0LFxuICAgICAgICBkaXN0cmlidXRpb24sXG4gICAgICAgIGRpc3RyaWJ1dGlvblBhdGhzOiBbXCIvKlwiXSxcbiAgICAgICAgcHJ1bmU6IHRydWUsXG4gICAgICAgIG1lbW9yeUxpbWl0OiA1MTIsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUgPSBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZTtcbiAgICB0aGlzLmJ1Y2tldE5hbWUgPSB3ZWJzaXRlQnVja2V0LmJ1Y2tldE5hbWU7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJXZWJzaXRlVVJMXCIsIHtcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogXCJDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBVUkxcIixcbiAgICAgIGV4cG9ydE5hbWU6IGAke2lkfS1XZWJzaXRlVVJMYCxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiQnVja2V0TmFtZVwiLCB7XG4gICAgICB2YWx1ZTogd2Vic2l0ZUJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgZGVzY3JpcHRpb246IFwiUzMgYnVja2V0IG5hbWVcIixcbiAgICAgIGV4cG9ydE5hbWU6IGAke2lkfS1CdWNrZXROYW1lYCxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiRGlzdHJpYnV0aW9uSWRcIiwge1xuICAgICAgdmFsdWU6IGRpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZCxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIElEXCIsXG4gICAgICBleHBvcnROYW1lOiBgJHtpZH0tRGlzdHJpYnV0aW9uSWRgLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJEaXN0cmlidXRpb25Eb21haW5OYW1lXCIsIHtcbiAgICAgIHZhbHVlOiBkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNsb3VkRnJvbnQgZG9tYWluIG5hbWVcIixcbiAgICAgIGV4cG9ydE5hbWU6IGAke2lkfS1EaXN0cmlidXRpb25Eb21haW5gLFxuICAgIH0pO1xuXG4gICAgaWYgKGNsb3VkZnJvbnRUb1MzLnMzTG9nZ2luZ0J1Y2tldCkge1xuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJTM0xvZ0J1Y2tldE5hbWVcIiwge1xuICAgICAgICB2YWx1ZTogY2xvdWRmcm9udFRvUzMuczNMb2dnaW5nQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkJ1Y2tldCBmb3IgUzMgYWNjZXNzIGxvZ3NcIixcbiAgICAgICAgZXhwb3J0TmFtZTogYCR7aWR9LVMzTG9nQnVja2V0YCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChjbG91ZGZyb250VG9TMy5jbG91ZEZyb250TG9nZ2luZ0J1Y2tldCkge1xuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJDbG91ZEZyb250TG9nQnVja2V0TmFtZVwiLCB7XG4gICAgICAgIHZhbHVlOiBjbG91ZGZyb250VG9TMy5jbG91ZEZyb250TG9nZ2luZ0J1Y2tldC5idWNrZXROYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJCdWNrZXQgZm9yIENsb3VkRnJvbnQgYWNjZXNzIGxvZ3NcIixcbiAgICAgICAgZXhwb3J0TmFtZTogYCR7aWR9LUNsb3VkRnJvbnRMb2dCdWNrZXRgLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2RrLlRhZ3Mub2YodGhpcykuYWRkKFwiU3RhY2tcIiwgXCJGcm9udGVuZFwiKTtcbiAgICBjZGsuVGFncy5vZih0aGlzKS5hZGQoXCJhd3MtbWNwOmRlcGxveTpzb3BcIiwgXCJkZXBsb3ktZnJvbnRlbmQtYXBwXCIpO1xuICB9XG59XG4iXX0=