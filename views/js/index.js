// import { Draggable } from '@shopify/draggable'
import { Sortable } from '@shopify/draggable';

const containers = document.querySelectorAll(".stack-list")
const sortable = new Sortable(containers, {
  draggable: '.draggable',
})
