//  ./services/userInfo.api.js

export async function getUserInfo() {
    try {
        const response = await fetch('/.auth/me');
        const payload = await response.json();
        const { clientPrincipal } = payload;
        return clientPrincipal;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('No profile could be found');
        return undefined;
    }
}

// const info = await getUserInfo();