import layout from '../../pages/courses/LearningLayout.module.css';

function renderLine(line, key) {
  const t = line.trim();
  if (t.startsWith('### ')) return <h3 key={key}>{t.slice(4)}</h3>;
  if (t.startsWith('## ')) return <h2 key={key}>{t.slice(3)}</h2>;
  if (t.startsWith('- ')) return <li key={key}>{t.slice(2)}</li>;
  if (!t) return null;
  return <p key={key}>{line}</p>;
}

export default function LessonContent({ content }) {
  if (!content?.trim()) return null;
  const lines = content.split('\n');
  const items = [];
  let listItems = [];

  lines.forEach((line, i) => {
    if (line.trim().startsWith('- ')) {
      listItems.push(renderLine(line, `li-${i}`));
    } else {
      if (listItems.length) {
        items.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        listItems = [];
      }
      const node = renderLine(line, `p-${i}`);
      if (node) items.push(node);
    }
  });
  if (listItems.length) items.push(<ul key="ul-end">{listItems}</ul>);

  return <div className={layout.markdown}>{items}</div>;
}
