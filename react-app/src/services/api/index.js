import { runProductPipeline } from './analyzeUser';
import { getUserAuthInfo } from './authenticateUser';

function useApi() {
    return {
        runProductPipeline,
        getUserAuthInfo
    };
}


export {
    runProductPipeline,
    getUserAuthInfo, 
    useApi
}