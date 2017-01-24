import React from 'react'
import ReactDOM from 'react-dom'
import { compose, withState, withHandlers } from 'recompose'

import { Dialog, Button, ControlGroup, Listbox, Item, Menu, MenuButton } from '../../src'
require('../../../elements/lib/styles.css')

const enhance = compose(
  withState('showDialog', 'toggle', false),
  withHandlers({
    onClick: props => event => {
      props.toggle(!props.showDialog)
    }
  })
)

const BosonicSamples = enhance(({ showDialog, onClick }) =>
  <div>
    <h2>Dialogs</h2>
    <Button onClick={onClick}>Open dialog</Button>
    <Dialog
      opened={showDialog}
      title="Test"
      footer={[
        <Button key="close" onClick={onClick}>Close</Button>
      ]}
      >
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer venenatis sodales arcu, ac fermentum metus hendrerit non. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </Dialog>

    <h2>Control group</h2>
    <ControlGroup>
      <label className="b-button">
          <input type="checkbox" autoComplete="off" defaultChecked="true"/> Checkbox 1
      </label>
      <label className="b-button">
          <input type="checkbox" autoComplete="off"/> Checkbox 2
      </label>
      <label className="b-button">
          <input type="checkbox" autoComplete="off"/> Checkbox 3
      </label>
    </ControlGroup>

    <h2>Listbox</h2>
    <Listbox>
      <Item>Top</Item>
      <Item>Middle</Item>
      <Item>Bottom</Item>
    </Listbox>

    <h2>Menu button</h2>
    <MenuButton>
      <Button>Menu</Button>
      <Menu>
        <Item>Top</Item>
        <Item>Middle</Item>
        <Item>Bottom</Item>
      </Menu>
    </MenuButton>
  </div>
)

ReactDOM.render(
  <BosonicSamples/>,
  document.getElementById('example')
)
