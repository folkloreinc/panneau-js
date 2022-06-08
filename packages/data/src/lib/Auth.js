import { getCSRFHeaders } from '@folklore/fetch';

class AuthApi {
    constructor(api, opts) {
        this.api = api;
        this.options = {
            withCredentials: true,
            ...opts,
        };
    }

    check() {
        const { withCredentials } = this.options;
        return this.api.requestGet(this.api.route('auth.check'), null, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    login(email, password) {
        const { withCredentials } = this.options;
        return this.api.requestPost(
            this.api.route('auth.login'),
            {
                email,
                password,
            },
            {
                withSession: !withCredentials,
                withCredentials,
            },
        );
    }

    register(data) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('auth.register'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    logout() {
        const url = this.api.getFullUrl(this.api.route('auth.logout'));
        return fetch(url, {
            method: 'POST',
            headers: {
                ...getCSRFHeaders(),
            },
            credentials: 'include',
        }).catch((err) => {
            console.log('logout err', err); // eslint-disable-line
            throw err;
        });
    }

    requestPassword(email) {
        const { withCredentials } = this.options;
        return this.api.requestPost(
            this.api.route('auth.password.email'),
            { email },
            {
                withSession: !withCredentials,
                withCredentials,
            },
        );
    }

    resetPassword(data) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('auth.password.update'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }
}

export default AuthApi;
