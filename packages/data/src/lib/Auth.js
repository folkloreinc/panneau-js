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
        return this.api.requestGet(this.api.route('login.check'), null, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    login(email, password) {
        const { withCredentials } = this.options;
        return this.api.requestPost(
            this.api.route('login'),
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
        return this.api.requestPost(this.api.route('register'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    logout() {
        const { withCredentials } = this.options;
        return this.api.fetchPost(this.api.route('logout'), null, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    requestPassword(email) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('password.email'), { email }, {
            withSession: !withCredentials,
            withCredentials,
        });
    }

    resetPassword(data) {
        const { withCredentials } = this.options;
        return this.api.requestPost(this.api.route('password.update'), data, {
            withSession: !withCredentials,
            withCredentials,
        });
    }
}

export default AuthApi;
