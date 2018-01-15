import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import TableList from '../TableList';

const items = [

];

test('match snapshot', () => {
    const component = renderer.create((
        <TableList
            items={items}
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
