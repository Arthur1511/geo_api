import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Map from './components/Map';
import Form from './components/Form';

const routes = () => {
    return (
        <Switch>
            <Route exact path='/'>
                <Form/>
                <Map/>
            </Route>

            {/* <Route exact path='/map' component={Map} /> */}

        </Switch>
    );
};

export default routes;