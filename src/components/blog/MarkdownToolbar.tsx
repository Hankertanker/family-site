'use client';

export default function MarkdownToolbar({ textareaId }: { textareaId: string }) {
  function insert(marker: string, wrapper = false) {
    const ta = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.substring(start, end);

    let newText: string;
    let cursorPos: number;

    if (wrapper) {
      newText =
        text.substring(0, start) + marker + selected + marker + text.substring(end);
      cursorPos = selected
        ? start + marker.length + selected.length + marker.length
        : start + marker.length;
    } else {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      newText = text.substring(0, lineStart) + marker + text.substring(lineStart);
      cursorPos = start + marker.length;
    }

    ta.value = newText;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    ta.setSelectionRange(cursorPos, cursorPos);
  }

  const buttons = [
    { label: 'H1', title: '一级标题', action: () => insert('# '), wide: false },
    { label: 'H2', title: '二级标题', action: () => insert('## '), wide: false },
    { label: 'H3', title: '三级标题', action: () => insert('### '), wide: false },
    { label: 'B', title: '加粗', action: () => insert('**', true), wide: false },
    { label: 'I', title: '斜体', action: () => insert('*', true), wide: false },
    { label: '•', title: '无序列表', action: () => insert('- '), wide: false },
    { label: '1.', title: '有序列表', action: () => insert('1. '), wide: false },
    { label: '🔗', title: '链接', action: linkInsert, wide: true },
    { label: '📷', title: '图片', action: imageInsert, wide: true },
    { label: '>', title: '引用', action: () => insert('> '), wide: false },
    { label: '—', title: '分割线', action: () => insert('\n---\n'), wide: false },
    { label: '`', title: '行内代码', action: () => insert('`', true), wide: false },
    { label: '```', title: '代码块', action: codeBlockInsert, wide: false },
  ];

  function linkInsert() {
    const ta = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    const prefix = '[';
    const mid = selected || '文字';
    const suffix = '](url)';
    const newText =
      ta.value.substring(0, start) + prefix + mid + suffix + ta.value.substring(end);
    ta.value = newText;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    ta.setSelectionRange(
      start + prefix.length + mid.length + 1,
      start + prefix.length + mid.length + 4
    );
  }

  function imageInsert() {
    const ta = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const newText =
      ta.value.substring(0, start) +
      '![图片描述](url)' +
      ta.value.substring(ta.selectionEnd);
    ta.value = newText;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    ta.setSelectionRange(start + 7, start + 9);
  }

  function codeBlockInsert() {
    const ta = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const newText =
      ta.value.substring(0, start) +
      '\n```\n' +
      ta.value.substring(ta.selectionEnd);
    ta.value = newText;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  return (
    <div className="flex flex-wrap gap-0.5 mb-2 p-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl">
      {buttons.map((btn, i) => (
        <button
          key={i}
          type="button"
          onClick={btn.action}
          title={btn.title}
          className="px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg transition-colors min-w-[30px] min-h-[30px] active:scale-95"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
