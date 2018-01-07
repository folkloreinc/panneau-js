import React from 'react';
import { Route } from 'react-router';

import Layout from '../components/Layout';
import Home from '../components/pages/Home';
import ResourceIndex from '../components/pages/ResourceIndex';
import ResourceCreate from '../components/pages/ResourceCreate';
import ResourceEdit from '../components/pages/ResourceEdit';
import ResourceDelete from '../components/pages/ResourceDelete';

export default urlGenerator => (
    <Route component={Layout}>
        <Route path="/" component={Home} />
        <Route path={urlGenerator.route('resource.index')} component={ResourceIndex} />
        <Route path={urlGenerator.route('resource.create')} component={ResourceCreate} />
        <Route path={urlGenerator.route('resource.edit')} component={ResourceEdit} />
        <Route path={urlGenerator.route('resource.delete')} component={ResourceDelete} />
    </Route>
);
