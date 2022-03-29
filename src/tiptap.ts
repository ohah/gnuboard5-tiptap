import Editor from "./index"
export default Editor;

(function () {
  (window as any).t = new Editor({
    element: document.querySelector("#container"),
    // content: `<pre><code class="language-katex">시발</code></pre>
    // <img src="https://i.ytimg.com/vi/-6Zjub7CH4k/hqdefault.jpg" />`,
    content: `<img src="https://i.ytimg.com/vi/-6Zjub7CH4k/hqdefault.jpg" />
<pre><code class="language-katex">c = \\pm\\sqrt{a^2 + b^2}</code></pre>
<pre><code class="language-mermaid">flowchart TD
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
//     content : `<pre><code class="language-mermaid">flowchart TD
// A[Start] --> B{Is it?};
// B -- Yes --> C[OK];
// C --> D[Rethink];
// D --> B;
// B -- No ----> E[End];</code></pre>`,
    // content : `<pre><code class="language-javascript">const a = "b";</code></pre>`,
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
