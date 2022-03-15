import { ChainedCommands, Editor as Tiptap, EditorOptions } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from '@tiptap/extension-text'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Italic from '@tiptap/extension-italic'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block';
import BulletList from '@tiptap/extension-bullet-list'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import ListItem from '@tiptap/extension-list-item'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import lowlight from 'lowlight'

import "remixicon/fonts/remixicon.css";

class Editor {
  private tiptap: Tiptap;
  private toolbar: HTMLElement;
  private wrapper: Element;
  private body: HTMLElement;
  private popup: HTMLElement;
  private footer: HTMLElement;
  private toolbarButton:{name : string | "separator", icon?:string, button?:Element | undefined, func? : string}[];
  constructor(option: Partial<EditorOptions>) {
    this.wrapper = option.element;
    this.wrapper.classList.add('tiptap');
    this.toolbar = document.createElement("div");
    this.toolbar.className = "tiptap-toolbar";
    this.popup = document.createElement("div");
    this.popup.className = "popup";
    this.body = document.createElement("div");
    this.body.className = "tiptap-body";
    this.footer = document.createElement("div");
    this.footer.className = "tiptap-container";
    this.wrapper.appendChild(this.toolbar);
    this.wrapper.appendChild(this.body);
    this.wrapper.appendChild(this.footer);
    
    this.Init(option);
  }
  private _editorInit(option: Partial<EditorOptions>) {
    this.tiptap = new Tiptap({
      ...option,
      extensions : [
        Document.configure({
          document : false,
        }),
        Italic,
        Strike,
        Underline,
        BulletList,
        ListItem,
        Bold,
        CodeBlock,
        Code,
        Blockquote,
        Paragraph,
        Color.configure({
          types : ['textStyle']
        }),
        TextStyle,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if(node.type.name === "p") return "내용을 입력하세요";
          }
        }),
        // CodeBlockLowlight.configure({lowlight}),
        Text,
        Heading,
        TaskItem,
        TaskList,
        CharacterCount,
        Highlight,
        Typography,
        Table,
        TableRow,
        TableCell,
        TableHeader,
        Image,
        Dropcursor,
        TextAlign
      ],
      element: this.body,
      onUpdate : (e) => {
        console.log('onUpdate', e);
      }
    });
  }
  async Init(option: Partial<EditorOptions>) {
    await this._editorInit(option)
    this.toolbarButton = [
      {name : 'source', icon : '<i class="ri-code-s-slash-line"></i>'},
      {name : 'separator'},
      {name : 'bold',  icon: '<i class="ri-bold"></i>', func : "toggleBold" },
      {name : 'italic',  icon: '<i class="ri-italic"></i>', func : "toggleItalic"},
      {name : 'underline',  icon: '<i class="ri-underline"></i>', func : "toggleUnderline"},
      {name : 'strike',  icon: '<i class="ri-strikethrough"></i>', func : "toggleStrike"},
      {name : 'bulletList',  icon: '<i class="ri-strikethrough"></i>', func : "toggleBulletList"},
      {name : 'color',  icon: '<i class="ri-font-color"></i>', func : "setColor(e.target.value)"},
      {name : 'separator'},
      {name : 'link',  icon: '<i class="ri-link"></i>', func : "toggleLink({ href: 'https://example.com' })"},
    ]
    this.tiptap.on("selectionUpdate",({editor, transaction})=>{
      this.toolbarButton.forEach((toolbar)=>{
        if(editor.isActive(toolbar.name) === true) {
          toolbar.button.classList.add('is-active');
        }else {
          toolbar.button.classList.remove('is-active');
        }
      })
    })
    this.tiptap.on("update",({editor, transaction})=>{
      this.toolbarButton.forEach((toolbar)=>{
        if(editor.isActive(toolbar.name) === true) {
          toolbar.button.classList.add('is-active');
        }else {
          toolbar.button.classList.remove('is-active');
        }
      })
    })
    await this.toolbarButton.map((toolbar)=>{
      if(toolbar.name == "separator")  {
        const div = document.createElement('div');
        div.classList.add('tiptap-separator');
        toolbar.button = div;
      } else {
        toolbar.button = this.createbutton({
          name : toolbar.name,
          icon : toolbar.icon,
          func : toolbar.func
        })
      }
      const { name, button } = toolbar;
      console.log(button);
      this.toolbar.appendChild(button);
      return toolbar;
    })
  }
  createbutton({name, icon, func}:{name:string, icon:string, func : string}) {
    if(name === 'color' && func) {
      const input = document.createElement('input');
      input.type = "color"
      input.className = "toolbar-color"
      input.addEventListener("input", (e)=>{
        (window as any).tiptap = this.tiptap;
        // console.log('e', e.target.value);
        // Function(`window.tiptap.chain().${func}.run()`)();
      }, false);
      return input;
    } else if(func) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.name = ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      button.addEventListener('click', (e)=> {
        (window as any).tiptap = this.tiptap;
        Function(`window.tiptap.chain().${func}().run()`)();
      },false);
      return button;
    }
    return document.createElement('button');
  }
}

(function () {
  new Editor({
    element: document.querySelector("#container"),
    content: `<p>Hello World!</p><p><strong>ere</strong></p><pre><code class="language-javascript">console.log('test')</code></pre>`,
    editorProps : {
      attributes : {
        class:"editor-body",
        style : "height:300px;overflow-y:auto"
      }
    }
  });
})();
