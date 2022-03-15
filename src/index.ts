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

declare global {
  interface Window {
    tiptap : Tiptap
  }
}

interface Toolbar {
  name:string | "separator"
  icon?:string
  button?:Element | undefined
  func?:string
  type? : "popup"
}

class Editor {
  private tiptap: Tiptap;
  private toolbar: HTMLElement;
  private wrapper: Element;
  private body: HTMLElement;
  private popup: HTMLElement;
  private footer: HTMLElement;
  private toolbarButton:Toolbar[];
  constructor(option: Partial<EditorOptions>) {
    this.wrapper = option.element;
    this.wrapper.classList.add('tiptap');
    this.toolbar = document.createElement("div");
    this.toolbar.className = "tiptap-toolbar";
    this.popup = document.createElement("div");
    this.popup.className = "popup";
    this.popup.innerHTML = `<div class="popup-content"></div>`
    this.body = document.createElement("div");
    this.body.className = "tiptap-body";
    this.footer = document.createElement("div");
    this.footer.className = "tiptap-container";
    this.wrapper.appendChild(this.toolbar);
    this.wrapper.appendChild(this.body);
    this.wrapper.appendChild(this.footer);
    document.body.addEventListener('click', (e)=>{
      // this.PopupClose()
    })
    this.Init(option);
  }

  /**
   * 
   * @param option 에디터 초기화
   */
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
    });
  }

  /**
   * Init 초기화
   * @param option tiptap 옵션 그대롯 ㅏㅇ속
   */
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
      {name : 'color',  icon: '<i class="ri-font-color"></i>', func : "setColor(e.target.value)", type : "popup"},
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

  /**
   * 버튼 생성
   * @param name "icon"
   * @param icon "icon"
   * @param func "이벤트(function)"
   * @returns element('이벤트')
   */
  createbutton({name, icon, func}:Toolbar) {
    if(name === 'color' && func) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.name = ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      button.addEventListener('click', (e)=> {
        window.tiptap = this.tiptap;
        const colors = ['#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC', '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#F7DA64', '#FBA026', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF', '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', undefined];
        const colorElement = document.createElement('div');
        colors.map(color => {
          const span = document.createElement('span');
          span.className = "set-color";
          span.style.background = color;
          if(this.tiptap.isActive('textStyle', { color: color })) {
            span.innerHTML = `<i class="ri-check-fill selected"></i>`;
          }
          span.addEventListener("click", (e)=>{
            this.tiptap.commands.setColor(color);
            this.PopupClose();
          }, false)
          colorElement.appendChild(span);
        });
        const inputWrapper = document.createElement('div');
        inputWrapper.className = "color-input-wrapper";
        inputWrapper.innerHTML = `<input type="text" value="${window.tiptap.getAttributes('textStyle').color ? window.tiptap.getAttributes('textStyle').color : ""}" /> <button class="popup-confirm">확인</button>`
        colorElement.appendChild(inputWrapper);
        this.Popup({
          parent : button,
          content : colorElement,
          width : 224,
        });
        // Function(`window.tiptap.chain().${func}().run()`)();
      },false);
      return button;
    } else if(func) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.name = ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      button.addEventListener('click', (e)=> {
        window.tiptap = this.tiptap;
        Function(`window.tiptap.chain().${func}().run()`)();
      },false);
      return button;
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.name = ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      return button;
    }
    return document.createElement('button');
  }

  /**
   * 팝업 열기
   * @param parent 부모 엘리먼트
   * @param content 내용. Element, string
   * @param width : 크기 number
   */
  private Popup ({parent, content, width}:{parent:Element, content:Element | string, width:number}) {
    const { top, left, height} = parent.getBoundingClientRect();
    console.log('실행');
    this.popup.innerHTML = '';
    if(typeof content === 'string') {
      this.popup.innerHTML = content;
    } else {
      this.popup.appendChild(content);
    }
    this.popup.style.top = `${top + height}px`;
    this.popup.style.left = `${left - (width / 2)}px`;
    this.popup.style.width = `${width}px`;
    this.popup.style.height = `auto`;
    // this.popup.style.display = "block";
    this.toolbar.appendChild(this.popup);
  }

  /**
   * 팝업 지우기
   */
  private PopupClose() {
    this.toolbar.removeChild(this.popup);
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
