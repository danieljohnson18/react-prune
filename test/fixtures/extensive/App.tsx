import React from 'react';
import { ComponentA } from './ComponentA';
import { ComponentB } from './ComponentB';
import { usedFunction } from './utils';
import _ from 'lodash';

export default function App() {
    usedFunction();
    return (
        <div>
            <h1>App</h1>
            <ComponentA />
            <ComponentB />
        </div>
    );
}
