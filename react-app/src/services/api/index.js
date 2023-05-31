import { runProductPipeline } from './analyzeUser';
import { getUserAuthInfo } from './authenticateUser';

function useApi() {
    return {
        pipeline: runProductPipeline,
        authenticate: getUserAuthInfo
    };
}

export {
    runProductPipeline,
    getUserAuthInfo, 
    useApi
}