import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import NormalForm from '../NormalForm';

const items = [

];

test('match snapshot', () => {
    const component = renderer.create((
        <NormalForm
            fields={fields}
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
