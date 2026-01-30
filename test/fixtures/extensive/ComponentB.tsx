import React from 'react';
import { useHookA } from './useHookA';

export const ComponentB = () => {
    const val = useHookA();
    return <div>Component B: {val}</div>;
};
