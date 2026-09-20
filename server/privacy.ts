import {isAuthorized, getCedarVersion} from '@cedar-policy/cedar-wasm/nodejs';

// The local server is a single-user tool. This switch applies to this server
// process, not to Cognito users or the separately deployed cloud job worker.
export const photoPolicy = `
permit(principal == User::"local", action in [Action::"analyze", Action::"compare", Action::"avatar"], resource == Resource::"photos")
when { context.processingEnabled };
permit(principal == User::"local", action == Action::"generate-preview", resource == Resource::"photos")
when { context.processingEnabled && context.generationEnabled };
`;
export function photoPermission(action: string, processingEnabled: boolean, generationEnabled: boolean) {
  const result = isAuthorized({principal:{type:'User',id:'local'}, action:{type:'Action',id:action}, resource:{type:'Resource',id:'photos'}, context:{processingEnabled,generationEnabled}, policies:{staticPolicies:photoPolicy}, entities:[]});
  return {allowed: result.type === 'success' && result.response.decision === 'allow', engine:'Cedar', version:getCedarVersion()};
}
