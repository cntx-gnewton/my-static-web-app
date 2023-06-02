
export async function getUserAuthInfo() {
    try {
        const response = await fetch('/.auth/me');
        const payload = await response.json();
        const { clientPrincipal } = payload;
        const { userDetails: displayName, ...rest } = clientPrincipal;
        return { displayName, ...rest };
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('No profile could be found');
        return undefined;
    }
}
