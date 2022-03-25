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
import Gapcursor from '@tiptap/extension-gapcursor'
// import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block';
import BulletList from '@tiptap/extension-bullet-list'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import HardBreak from '@tiptap/extension-hard-break'
import History from '@tiptap/extension-history';
import lowlight from 'lowlight'
import "remixicon/fonts/remixicon.css";
import Image from './extensions/ResizeImage'
import Iframe from "./extensions/Iframe";
import { CustomBlockExtension } from "./extensions/CustomCodeBlock";

declare global {
  interface Window {
    tiptap : Tiptap
  }
}

/**
 * @param name "color(글색)" | "justify(정렬)"
 */
interface Toolbar {
  name:string | "separator" | "color" | "justify" | "video" | "link"
  tooltip?:string
  icon?:string
  button?:Element | undefined
  func?:string
  type?:"popup"
}

interface editorOptions extends Partial<EditorOptions>{
  ImageUpload? : (e:FileList) => Promise<any> | undefined
}

class Editor {
  private tiptap: Tiptap;
  private toolbar: HTMLElement;
  private wrapper: Element;
  private body: HTMLElement;
  private popup: HTMLElement;
  private footer: HTMLElement;
  private toolbarButton:Toolbar[];
  private option:editorOptions;
  private source:HTMLTextAreaElement;
  constructor(option: editorOptions) {
    this.wrapper = option.element;
    this.option = option;
    this.wrapper.classList.add('tiptap');
    this.toolbar = document.createElement("div");
    this.toolbar.className = "tiptap-toolbar";
    this.popup = document.createElement("div");
    this.popup.className = "popup";
    this.body = document.createElement("div");
    this.body.className = "tiptap-body";
    this.footer = document.createElement("div");
    this.footer.className = "tiptap-container";
    this.source = document.createElement("textarea");
    this.source.className = `tiptap-source ${option.editorProps.attributes["class"]}`;
    // this.source.setAttribute("style", option.editorProps.attributes["style"]);
    // this.source.style.display = "none";
    // this.body.style.display = "block";
    this.wrapper.appendChild(this.toolbar);
    this.wrapper.appendChild(this.body);
    this.body.appendChild(this.source);
    this.wrapper.appendChild(this.footer);
    /* 
    * 팝업창 외의 다른 영역 클릭시 닫기 이벤트.
    * 팝업의 모든 요소에 popup-child 클래스를 넣음.
    */
    let popupOver = false;
    this.wrapper.addEventListener('mouseover', (e)=>{
      if((e.target as Element).classList.contains('popup-child')){
        popupOver = true;
      } else {
        popupOver = false;
      }
    });
    document.body.addEventListener("click", (e)=>{
      if(popupOver === false) {
        this.PopupClose();
      }
    }, false);
    this.Init(option);
  }

  /**
   * 
   * @param option 에디터 초기화
   */
  private _editorInit(option: editorOptions) {
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
        Gapcursor,
        ListItem,
        OrderedList,
        Bold,
        CodeBlock,
        Code,
        Blockquote,
        History,
        Link,
        Iframe,
        HardBreak,
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
        CustomBlockExtension,
        Text,
        Heading,
        TaskItem,
        TaskList,
        CharacterCount,
        Highlight,
        Typography,
        Table.configure({
          resizable : true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        Image,
        Dropcursor,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        })
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
      // {name : 'source', tooltip: "소스보기", icon : '<i class="ri-code-s-slash-line"></i>'},
      // {name : 'separator'},
      {name : 'bold', tooltip: "굵게", icon: '<i class="ri-bold"></i>', func : "toggleBold" },
      {name : 'italic', tooltip : "기울임", icon: '<i class="ri-italic"></i>', func : "toggleItalic"},
      {name : 'underline', tooltip : "밑줄", icon: '<i class="ri-underline"></i>', func : "toggleUnderline"},
      {name : 'strike',  tooltip : "밑줄", icon: '<i class="ri-strikethrough"></i>', func : "toggleStrike"},
      {name : 'color',  tooltip : "글 색깔", icon: '<i class="ri-font-color"></i>', func : "setColor(e.target.value)", type : "popup"},
      {name : 'separator'},
      {name : 'link',  tooltip : "링크", icon: '<i class="ri-link"></i>'},
      {name : 'image',  tooltip : "이미지", icon: '<i class="ri-image-add-fill"></i>'},
      {name : 'video',  tooltip : "비디오", icon: '<i class="ri-video-add-fill"></i>'},
      {name : 'table',  tooltip : "표", icon: '<i class="ri-table-2"></i>'},
      {name : 'separator'},
      {name : 'bulletList',  tooltip : "목록", icon: '<i class="ri-list-unordered"></i>', func : "toggleBulletList"},
      {name : 'orderedList',  tooltip : "목록(번호)", icon: '<i class="ri-list-ordered"></i>', func : "toggleOrderedList"},
      {name : 'taskList',  tooltip : "목록(체크)", icon: '<i class="ri-task-line"></i>', func : "toggleTaskList"},
      {name : 'justify',  tooltip : "정렬", icon: '<i class="ri-align-justify"></i>'},
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
          func : toolbar.func,
          tooltip : toolbar.tooltip
        })
      }
      const { name, button } = toolbar;
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
  createbutton({name, icon, tooltip, func}:Toolbar) {
    if(name === "justify") {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = "justify-align"
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
      const dropdown = document.createElement('div');
      dropdown.className = "dropdown";
      ['left', 'center', 'right', 'justify'].map((align)=>{
        const alignBtn = document.createElement('button');
        alignBtn.dataset.align = align;
        const i = document.createElement('i');
        i.className = `ri-align-${align}`;
        alignBtn.appendChild(i);
        // alignBtn.innerHTML = `<i class="ri-align-${align}"></i>`;
        alignBtn.addEventListener('click', (e)=> {
          e.preventDefault();
          e.stopPropagation();
          this.tiptap.chain().focus().setTextAlign(align).run();
        }, false);
        dropdown.appendChild(alignBtn);
      });
      button.addEventListener('click', (e)=>{
        // this.tiptap.chain().focus().setTextAlign('center').run()
      });
      button.appendChild(dropdown);
      return button;
    } else if(name === "source") {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // this.body.appendChild(this.source);
        if((this.tiptap.view.dom as HTMLElement).style.visibility !== "hidden") {
          this.source.style.visibility = "visible";
          (this.tiptap.view.dom as HTMLElement).style.visibility = "hidden";
          console.log(this.tiptap.getJSON())
          this.source.value = this.tiptap.getHTML();
          this.source.focus();
        } else {
          // this.tiptap.commands.setContent(this.source.value);
          this.source.style.visibility = "hidden";
          (this.tiptap.view.dom as HTMLElement).style.visibility = "visible";
          console.log(this.source.value);
          this.tiptap.commands.setContent(this.source.value);
          this.tiptap.chain().focus();
        }
        // this.tiptap.destroy();
      }, false)
      
      return button;
    }else if(name === 'video') {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
     
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        // popup.style.width = "300px";
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-tab popup-child">`,
              `<button type="button" class="popup-child" data-tab="1"><i class="ri-links-line popup-child"></i></button>`,
              `<button type="button" class="popup-child" data-tab="2"><i class="ri-code-s-slash-fill popup-child"></i></button>`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="1" style="display:block">`,
              `<input type="text" autocomplete="off" class="popup-child" name="url" placeholder="동영상 URL 붙여넣기" />`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="2" style="display:none">`,
              `<textarea placeholder="임베디드코드" autocomplete="off" name="embed" class="popup-child embed-textarea"></textarea>`,
            `</div>`,
            `<div class="popup-button popup-child">`,
              `<button type="button" class="confirm popup-child"> 삽입 </button>`,
            `</div>`,
          `</div>`
        ].join('');
        const tabBtn = popup.querySelectorAll('button[data-tab]');
        tabBtn.forEach((btn:HTMLElement) => {
          btn.addEventListener('click', (e)=>{
            const Idx = btn.dataset.tab;
            console.log(Idx);
            popup.querySelectorAll(`.popup-input[data-tab]`).forEach(element => {
              element.setAttribute("style", "display:none");
            });
            const tab = popup.querySelector(`.popup-input[data-tab="${Idx}"]`)
            tab.setAttribute("style", "display:block");
          }, false);
        });
        popup.querySelector('button.confirm').addEventListener("click", (e)=> {
          e.preventDefault();
          if(popup.querySelector(`.popup-input[data-tab="1"]`).getAttribute("style") === "display:block") {
            const url = (popup.querySelector('input[name=url]') as HTMLInputElement).value;
            if(!url) {
              alert('URL을 입력하세요');
              return false;
            }
            this.tiptap.chain().focus().setIframe({ src: url }).run()
            return false;
          } else {
            const text = (popup.querySelector('textarea[name=embed]') as HTMLTextAreaElement).value;
            if(!text) {
              alert('텍스트를 입력하세요');
              return false;
            }
            this.tiptap.chain().focus().insertContent(text).run();
          }
          
          // this.tiptap.chain().setLink({href:url, target : target ? "_blank" : "" }).insertContent(text).run();
          // this.tiptap.chain().focus();
          // this.PopupClose();
          // console.log(e);
        }, false)
        // button.appendChild(popup);
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === 'table') {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        // popup.style.width = "300px";
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-input popup-child">`,
              `<div class="popup-child table-row-input">`,
                `<label class="popup-child"> 행 </label>`,
                `<input type="number" value="3"  min="1" autocomplete="off" class="popup-child" name="row" placeholder="행" />`,
              `</div>`,
              `<div class="popup-child table-col-input">`,
                `<label class="class="popup-child"> 열 </label>`,
                `<input type="number" value="3" min="1" autocomplete="off" class="popup-child" name="col" placeholder="열" />`,
              `</div>`,
            `</div>`,
            `<div class="popup-button popup-child">`,
              `<button type="button" class="confirm popup-child"> 삽입 </button>`,
            `</div>`,
          `</div>`
        ].join('');
        popup.querySelector('.confirm').addEventListener('click', (e)=>{
          const row = (popup.querySelector(`input[name=row]`) as HTMLInputElement).value;
          const col = (popup.querySelector(`input[name=col]`) as HTMLInputElement).value;
          this.tiptap.chain().insertTable({ rows: parseInt(row), cols: parseInt(col), withHeaderRow: true }).focus().run();
          this.PopupClose();
        })
        // button.appendChild(popup);
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === "image") {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
     
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        // popup.style.width = "300px";
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-tab popup-child">`,
              `<button type="button" class="popup-child" data-tab="1"><i class="ri-upload-fill popup-child"></i></button>`,
              `<button type="button" class="popup-child" data-tab="2"><i class="ri-links-fill popup-child"></i></button>`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="1" style="display:block">`,
              `<label for="tiptap-image-upload" class="popup-child tiptap-drag-and-drop-upload">`,
                `<input id="tiptap-image iptap-image-upload" class="popup-child" type="file" accept="image/jpeg, image/jpg, image/png, image/gif, image/webp" tabindex="-1">`,
              `</label>`,
            `</div>`,
            `<div class="popup-input popup-child tab" data-tab="2" style="display:none">`,
              `<input type="text" autocomplete="off" class="popup-child" name="url" placeholder="이미지 URL 붙여넣기" />`,
              `<div class="popup-button popup-child">`,
                `<button type="button" class="confirm popup-child"> 삽입 </button>`,
              `</div>`,
            `</div>`,
          `</div>`
        ].join('');
        const fileInput = popup.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput.addEventListener("change", (e)=>{
          const files = (e.target as HTMLInputElement).files;
          if(files && this.option.ImageUpload) {
            this.option.ImageUpload(files).then((row)=> {
              if(row.url) {
                this.tiptap.commands.setImage({src: `${row.url}`})
              }
              // console.log('files', files);
            });
          }          
        }, false)
        const tabBtn = popup.querySelectorAll('button[data-tab]');
        tabBtn.forEach((btn:HTMLElement) => {
          btn.addEventListener('click', (e)=>{
            const Idx = btn.dataset.tab;
            popup.querySelectorAll(`.popup-input[data-tab]`).forEach(element => {
              element.setAttribute("style", "display:none");
            });
            const tab = popup.querySelector(`.popup-input[data-tab="${Idx}"]`)
            tab.setAttribute("style", "display:block");
          }, false);
        });
        popup.querySelector('button.confirm').addEventListener("click", (e)=> {
          e.preventDefault();
          if(popup.querySelector(`.popup-input[data-tab="1"]`).getAttribute("style") === "display:block") {
            const url = (popup.querySelector('input[name=url]') as HTMLInputElement).value;
            if(!url) {
              alert('URL을 입력하세요');
              return false;
            }
            this.tiptap.chain().focus().setIframe({ src: url }).run()
            return false;
          } else {
            const text = (popup.querySelector('textarea[name=embed]') as HTMLTextAreaElement).value;
            if(!text) {
              alert('텍스트를 입력하세요');
              return false;
            }
            this.tiptap.chain().focus().insertContent(text).run();
          }
        }, false)
        // button.appendChild(popup);
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === 'link') {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = [
        `${icon}`,
      ].join('');
     
      button.addEventListener('click', (e)=>{
        e.stopPropagation();
        const popup = document.createElement('div');
        popup.className = "popup-content link-popup";
        popup.dataset.popup = 'link';
        // popup.style.width = "300px";
        popup.innerHTML = [
          `<div class="popup-content popup-child">`,
            `<div class="popup-input popup-child">`,
              `<input type="text" autocomplete="off" class="popup-child" name="url" placeholder="URL" />`,
            `</div>`,
            `<div class="popup-input popup-child">`,
              `<input type="text" autocomplete="off" class="popup-child" name="text" placeholder="텍스트" />`,
            `</div>`,
            `<div class="popup-checkbox popup-child">`,
              `<label class="popup-child">`,
                `<input type="checkbox" class="popup-child" name="target"/>`,
                `<span class="popup-child"> 새 탭에서 열기 </span>`,
              `</label>`,
            `</div>`,
            `<div class="popup-button popup-child">`,
              `<button type="button" class="popup-child"> 삽입 </button>`,
            `</div>`,
          `</div>`
        ].join('');
        popup.querySelector('button').addEventListener("click", (e)=> {
          const url = (popup.querySelector('input[name=url]') as HTMLInputElement).value;
          const text = (popup.querySelector('input[name=text]') as HTMLInputElement).value;
          const target = popup.querySelector('input[name=target]:checked');
          if(!url) {
            alert('URL을 입력하세요');
            return false;
          }
          if(!text) {
            alert('텍스트를 입력하세요');
            return false;
          }
          this.tiptap.chain().setLink({href:url, target : target ? "_blank" : "" }).insertContent(text).run();
          this.tiptap.chain().focus();
          this.PopupClose();
          console.log(e);
        }, false)
        // button.appendChild(popup);
        this.Popup({
          parent : button,
          content : popup,
          width : 300,
        });
      }, false)
      return button;
    } else if(name === 'color' && func) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      button.addEventListener('click', (e)=> {
        e.stopPropagation();
        window.tiptap = this.tiptap;
        const colors = ['#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC', '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#F7DA64', '#FBA026', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF', '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', undefined];
        const colorElement = document.createElement('div');
        colors.map(color => {
          const span = document.createElement('span');
          span.className = "set-color popup-child";
          span.style.background = color;
          if(this.tiptap.isActive('textStyle', { color: color })) {
            span.innerHTML = `<i class="ri-check-fill selected"></i>`;
          }
          span.addEventListener("click", (e)=>{
            this.tiptap.commands.setColor(color);
            this.tiptap.chain().focus();
            this.PopupClose();
          }, false)
          colorElement.appendChild(span);
        });
        const inputWrapper = document.createElement('div');
        inputWrapper.className = "color-input-wrapper popup-child";
        inputWrapper.innerHTML = `<input type="text" value="${window.tiptap.getAttributes('textStyle').color ? window.tiptap.getAttributes('textStyle').color : ""}" /> <button type="button" class="popup-confirm popup-child">확인</button>`
        colorElement.appendChild(inputWrapper);
        inputWrapper.querySelector('button').addEventListener('click', (e)=>{
          e.stopPropagation();
          const regx = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
          if(regx.test(inputWrapper.querySelector('input').value)) {
            console.log('color', inputWrapper.querySelector('input').value);
            this.tiptap.commands.setColor(inputWrapper.querySelector('input').value);
            this.PopupClose();
          } else {
            alert('잘못 된 형식의 값입니다');
          }
        })
        this.Popup({
          parent : button,
          content : colorElement,
          width : 224,
        });
      },false);
      return button;
    } else if(func) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? tooltip : ""
      button.tabIndex = -1;
      button.innerHTML = icon;
      button.addEventListener('click', (e)=> {
        e.stopPropagation();
        window.tiptap = this.tiptap;
        Function(`window.tiptap.chain().${func}().run()`)();
        this.tiptap.chain().focus();
      },false);
      return button;
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tooltip = tooltip ? "tooltip" : ""
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
    this.popup.style.left = `${left - (width / 2) + 17}px`;
    this.popup.style.width = `${width}px`;
    this.popup.style.height = `auto`;
    // this.popup.style.display = "block";
    this.toolbar.appendChild(this.popup);
  }

  /**
   * 팝업 지우기
   */
  private PopupClose() {
    try {
      this.toolbar.removeChild(this.popup);
    }catch(e){ 

    }
  }
}

(function () {
  new Editor({
    element: document.querySelector("#container"),
    content: `<pre><code class="language-mermaid">flowchart TD
A[Start] --> B{Is it?};
B -- Yes --> C[OK];
C --> D[Rethink];
D --> B;
B -- No ----> E[End];</code></pre>
<pre><code class="language-javascript">console.log('asdf');</code></pre>
<pre><code class="language-mermaid">graph TD
A[Christmas] -->|Get money| B(Go shopping)
B --> C{Let me think}
C -->|One| D[Laptop]
C -->|Two| E[iPhonee]
C -->|Three| F[Cars]</code></pre>
<pre><code class="language-javascript">console.log('asdf');</code></pre>
<img src="https://i.ytimg.com/vi/-6Zjub7CH4k/hqdefault.jpg" />
    `,
    editorProps : {
      attributes : {
        class:"editor-body",
        style : "height:800px;overflow-y:auto"
      }
    },
    ImageUpload : function(files) {
      return new Promise(function(resolve, reject) {
        resolve({url:"https://i.ytimg.com/vi/-6Zjub7CH4k/hqdefault.jpg"});
      });
    }
  });
})();
