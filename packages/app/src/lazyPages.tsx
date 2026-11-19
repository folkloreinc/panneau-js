import { type ComponentProps, Suspense, lazy } from 'react';

import { AuthSkeleton } from './auth/AuthLayout';
import type { LoginPage as LoginPageComponent } from './auth/LoginPage';
import type { ResetPasswordPage as ResetPasswordPageComponent } from './auth/ResetPasswordPage';
import type { TwoFactorRequiredPage as TwoFactorRequiredPageComponent } from './auth/TwoFactorRequiredPage';
import type {
    EmailVerificationLinkPage as EmailVerificationLinkPageComponent,
    VerifyEmailPage as VerifyEmailPageComponent,
} from './auth/VerifyEmailPage';
import type {
    Dashboard as DashboardComponent,
    DashboardGrid as DashboardGridComponent,
} from './dashboard/Dashboard';
import { DashboardGridSkeleton, DashboardSkeleton } from './dashboard/DashboardSkeleton';
import type { AccountPage as AccountPageComponent } from './pages/AccountPage';
import { PageSkeleton } from './pages/PageSkeleton';

// The pages off the path of lists and forms load on first use, with the skeleton of their shape
// while their code loads (#346): the auth pages, the account page and the dashboards, with the grid
// of widgets of the summaries above lists. The components below take the props of what they load.

const LazyLoginPage = lazy(async () => ({
    default: (await import('./auth/LoginPage')).LoginPage,
}));
const LazyResetPasswordPage = lazy(async () => ({
    default: (await import('./auth/ResetPasswordPage')).ResetPasswordPage,
}));
const LazyTwoFactorRequiredPage = lazy(async () => ({
    default: (await import('./auth/TwoFactorRequiredPage')).TwoFactorRequiredPage,
}));
const LazyVerifyEmailPage = lazy(async () => ({
    default: (await import('./auth/VerifyEmailPage')).VerifyEmailPage,
}));
const LazyEmailVerificationLinkPage = lazy(async () => ({
    default: (await import('./auth/VerifyEmailPage')).EmailVerificationLinkPage,
}));
const LazyDashboard = lazy(async () => ({
    default: (await import('./dashboard/Dashboard')).Dashboard,
}));
const LazyDashboardGrid = lazy(async () => ({
    default: (await import('./dashboard/Dashboard')).DashboardGrid,
}));
const LazyAccountPage = lazy(async () => ({
    default: (await import('./pages/AccountPage')).AccountPage,
}));

export function LoginPage(props: ComponentProps<typeof LoginPageComponent>) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyLoginPage {...props} />
        </Suspense>
    );
}

export function ResetPasswordPage(props: ComponentProps<typeof ResetPasswordPageComponent>) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyResetPasswordPage {...props} />
        </Suspense>
    );
}

export function TwoFactorRequiredPage(
    props: ComponentProps<typeof TwoFactorRequiredPageComponent>,
) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyTwoFactorRequiredPage {...props} />
        </Suspense>
    );
}

export function VerifyEmailPage(props: ComponentProps<typeof VerifyEmailPageComponent>) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyVerifyEmailPage {...props} />
        </Suspense>
    );
}

export function EmailVerificationLinkPage(
    props: ComponentProps<typeof EmailVerificationLinkPageComponent>,
) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <LazyEmailVerificationLinkPage {...props} />
        </Suspense>
    );
}

export function AccountPage(props: ComponentProps<typeof AccountPageComponent>) {
    return (
        <Suspense fallback={<PageSkeleton width="narrow" />}>
            <LazyAccountPage {...props} />
        </Suspense>
    );
}

export function Dashboard(props: ComponentProps<typeof DashboardComponent>) {
    return (
        <Suspense fallback={<DashboardSkeleton definition={props.definition} page={props.page} />}>
            <LazyDashboard {...props} />
        </Suspense>
    );
}

export function DashboardGrid(props: ComponentProps<typeof DashboardGridComponent>) {
    return (
        <Suspense fallback={<DashboardGridSkeleton widgets={props.widgets} />}>
            <LazyDashboardGrid {...props} />
        </Suspense>
    );
}
