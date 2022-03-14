import { Editor as Tiptap, EditorOptions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import 'remixicon/fonts/remixicon.css'

class Editor {
  private tiptap:Tiptap;
  private menu:HTMLElement;
  private wrapper:Element;
  private body:HTMLElement;
  private footer:HTMLElement;
  constructor(option:Partial<EditorOptions>) {
    this.wrapper = option.element;
    this.menu = document.createElement('div');
    this.menu.className = "tiptap-top";
    this.body = document.createElement('div');
    this.body.className = "tiptap-body";
    this.footer = document.createElement('div');
    this.footer.className = "tiptap-container";
    this.wrapper.appendChild(this.menu);
    this.wrapper.appendChild(this.body);
    this.wrapper.appendChild(this.footer);
    this.tiptap = new Tiptap({
      ...option,
      element : this.body
    })
  }
}

(function(){
  new Editor({
    element: document.querySelector('#container'),
    extensions: [
      StarterKit,
    ],
    content: '<p>Hello World!</p>',
  })
})();