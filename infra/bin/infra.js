#!/usr/bin/env node
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
const cdk = __importStar(require("aws-cdk-lib"));
const child_process_1 = require("child_process");
const frontend_stack_1 = require("../lib/stacks/frontend-stack");
const pipeline_stack_1 = require("../lib/stacks/pipeline-stack");
const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || "us-east-1";
const codeConnectionArn = app.node.tryGetContext("codeConnectionArn");
const repositoryName = app.node.tryGetContext("repositoryName") || "PawRush/swyxkit";
const branchName = app.node.tryGetContext("branchName") || "deploy-to-aws";
// Standalone preview/local stacks (when not building pipeline)
if (!codeConnectionArn) {
    const getDefaultEnvironment = () => {
        try {
            const username = process.env.USER || (0, child_process_1.execSync)("whoami").toString().trim();
            return `preview-${username}`;
        }
        catch {
            return "preview-local";
        }
    };
    const environment = app.node.tryGetContext("environment") || getDefaultEnvironment();
    const buildOutputPath = app.node.tryGetContext("buildPath") || "../.svelte-kit/output/client";
    new frontend_stack_1.FrontendStack(app, `SwyxkitFrontend-${environment}`, {
        env: { account, region },
        environment,
        buildOutputPath,
        description: `Static website hosting - ${environment}`,
        terminationProtection: environment === "prod",
    });
}
// Pipeline stack (when codeConnectionArn provided)
if (codeConnectionArn) {
    new pipeline_stack_1.PipelineStack(app, "SwyxkitPipelineStack", {
        env: { account, region },
        description: "CI/CD Pipeline for SwyxKit",
        codeConnectionArn,
        repositoryName,
        branchName,
        terminationProtection: true,
    });
}
cdk.Tags.of(app).add("Project", "swyxkit");
cdk.Tags.of(app).add("ManagedBy", "CDK");
if (!codeConnectionArn) {
    const environment = app.node.tryGetContext("environment") || "preview";
    cdk.Tags.of(app).add("Environment", environment);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpREFBbUM7QUFDbkMsaURBQXlDO0FBQ3pDLGlFQUE2RDtBQUM3RCxpRUFBNkQ7QUFFN0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztBQUNoRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLFdBQVcsQ0FBQztBQUU3RCxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDdEUsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxpQkFBaUIsQ0FBQztBQUNyRixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxlQUFlLENBQUM7QUFFM0UsK0RBQStEO0FBQy9ELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0scUJBQXFCLEdBQUcsR0FBVyxFQUFFO1FBQ3pDLElBQUksQ0FBQztZQUNILE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUEsd0JBQVEsRUFBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxRSxPQUFPLFdBQVcsUUFBUSxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNQLE9BQU8sZUFBZSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDLENBQUM7SUFFRixNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO0lBQ3JGLE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLDhCQUE4QixDQUFDO0lBRTlGLElBQUksOEJBQWEsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLFdBQVcsRUFBRSxFQUFFO1FBQ3ZELEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7UUFDeEIsV0FBVztRQUNYLGVBQWU7UUFDZixXQUFXLEVBQUUsNEJBQTRCLFdBQVcsRUFBRTtRQUN0RCxxQkFBcUIsRUFBRSxXQUFXLEtBQUssTUFBTTtLQUM5QyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsbURBQW1EO0FBQ25ELElBQUksaUJBQWlCLEVBQUUsQ0FBQztJQUN0QixJQUFJLDhCQUFhLENBQUMsR0FBRyxFQUFFLHNCQUFzQixFQUFFO1FBQzdDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7UUFDeEIsV0FBVyxFQUFFLDRCQUE0QjtRQUN6QyxpQkFBaUI7UUFDakIsY0FBYztRQUNkLFVBQVU7UUFDVixxQkFBcUIsRUFBRSxJQUFJO0tBQzVCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDekMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDdkIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksU0FBUyxDQUFDO0lBQ3ZFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IEZyb250ZW5kU3RhY2sgfSBmcm9tIFwiLi4vbGliL3N0YWNrcy9mcm9udGVuZC1zdGFja1wiO1xuaW1wb3J0IHsgUGlwZWxpbmVTdGFjayB9IGZyb20gXCIuLi9saWIvc3RhY2tzL3BpcGVsaW5lLXN0YWNrXCI7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5cbmNvbnN0IGFjY291bnQgPSBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5UO1xuY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OIHx8IFwidXMtZWFzdC0xXCI7XG5cbmNvbnN0IGNvZGVDb25uZWN0aW9uQXJuID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dChcImNvZGVDb25uZWN0aW9uQXJuXCIpO1xuY29uc3QgcmVwb3NpdG9yeU5hbWUgPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KFwicmVwb3NpdG9yeU5hbWVcIikgfHwgXCJQYXdSdXNoL3N3eXhraXRcIjtcbmNvbnN0IGJyYW5jaE5hbWUgPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KFwiYnJhbmNoTmFtZVwiKSB8fCBcImRlcGxveS10by1hd3NcIjtcblxuLy8gU3RhbmRhbG9uZSBwcmV2aWV3L2xvY2FsIHN0YWNrcyAod2hlbiBub3QgYnVpbGRpbmcgcGlwZWxpbmUpXG5pZiAoIWNvZGVDb25uZWN0aW9uQXJuKSB7XG4gIGNvbnN0IGdldERlZmF1bHRFbnZpcm9ubWVudCA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1c2VybmFtZSA9IHByb2Nlc3MuZW52LlVTRVIgfHwgZXhlY1N5bmMoXCJ3aG9hbWlcIikudG9TdHJpbmcoKS50cmltKCk7XG4gICAgICByZXR1cm4gYHByZXZpZXctJHt1c2VybmFtZX1gO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIFwicHJldmlldy1sb2NhbFwiO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBlbnZpcm9ubWVudCA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoXCJlbnZpcm9ubWVudFwiKSB8fCBnZXREZWZhdWx0RW52aXJvbm1lbnQoKTtcbiAgY29uc3QgYnVpbGRPdXRwdXRQYXRoID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dChcImJ1aWxkUGF0aFwiKSB8fCBcIi4uLy5zdmVsdGUta2l0L291dHB1dC9jbGllbnRcIjtcblxuICBuZXcgRnJvbnRlbmRTdGFjayhhcHAsIGBTd3l4a2l0RnJvbnRlbmQtJHtlbnZpcm9ubWVudH1gLCB7XG4gICAgZW52OiB7IGFjY291bnQsIHJlZ2lvbiB9LFxuICAgIGVudmlyb25tZW50LFxuICAgIGJ1aWxkT3V0cHV0UGF0aCxcbiAgICBkZXNjcmlwdGlvbjogYFN0YXRpYyB3ZWJzaXRlIGhvc3RpbmcgLSAke2Vudmlyb25tZW50fWAsXG4gICAgdGVybWluYXRpb25Qcm90ZWN0aW9uOiBlbnZpcm9ubWVudCA9PT0gXCJwcm9kXCIsXG4gIH0pO1xufVxuXG4vLyBQaXBlbGluZSBzdGFjayAod2hlbiBjb2RlQ29ubmVjdGlvbkFybiBwcm92aWRlZClcbmlmIChjb2RlQ29ubmVjdGlvbkFybikge1xuICBuZXcgUGlwZWxpbmVTdGFjayhhcHAsIFwiU3d5eGtpdFBpcGVsaW5lU3RhY2tcIiwge1xuICAgIGVudjogeyBhY2NvdW50LCByZWdpb24gfSxcbiAgICBkZXNjcmlwdGlvbjogXCJDSS9DRCBQaXBlbGluZSBmb3IgU3d5eEtpdFwiLFxuICAgIGNvZGVDb25uZWN0aW9uQXJuLFxuICAgIHJlcG9zaXRvcnlOYW1lLFxuICAgIGJyYW5jaE5hbWUsXG4gICAgdGVybWluYXRpb25Qcm90ZWN0aW9uOiB0cnVlLFxuICB9KTtcbn1cblxuY2RrLlRhZ3Mub2YoYXBwKS5hZGQoXCJQcm9qZWN0XCIsIFwic3d5eGtpdFwiKTtcbmNkay5UYWdzLm9mKGFwcCkuYWRkKFwiTWFuYWdlZEJ5XCIsIFwiQ0RLXCIpO1xuaWYgKCFjb2RlQ29ubmVjdGlvbkFybikge1xuICBjb25zdCBlbnZpcm9ubWVudCA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoXCJlbnZpcm9ubWVudFwiKSB8fCBcInByZXZpZXdcIjtcbiAgY2RrLlRhZ3Mub2YoYXBwKS5hZGQoXCJFbnZpcm9ubWVudFwiLCBlbnZpcm9ubWVudCk7XG59XG4iXX0=