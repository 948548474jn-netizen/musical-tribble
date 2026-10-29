import { lazy, Suspense, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, RotateCcw, Mail, Sun, Moon } from 'lucide-react';
import './cabinet.css';
import { useArchiveTheme } from './theme.js';
import './theme.css';
const CabinetScene = lazy(() => import('./CabinetScene.jsx'));
const items = [
  ['01', '作品册', '精选视觉作品', '#work'],
  ['02', '个人档案', '关于我与工作经历', '#about'],
  ['03', '技能卡', '从想法到视觉落地', '#capabilities'],
  ['04', '创作实验', '一些好奇心的切片', '#experiments'],
];
export default function InteractiveHero() {
  const { theme, toggleTheme } = useArchiveTheme();
  const [opened, setOpened] = useState(false), [busy, setBusy] = useState(false), [ready, setReady] = useState(null);
  return <section className={`hero cabinet-hero cabinet-centered ${opened ? 'drawer-open' : ''} ${busy ? 'camera-moving' : ''}`} id="top" aria-labelledby="hero-title">
    <div className="cabinet-topline mono"><span>JN—026 / PERSONAL DESIGN ARCHIVE</span><span>BEIJING, CN · VISUAL DESIGNER</span></div>
    <div className="cabinet-layout">
      <div className="cabinet-intro">
        <p className="eyebrow"><span className="live-dot"/> 江南的设计档案</p>
        <h1 id="hero-title">江南<span>的设计抽屉。</span></h1>
        <p className="cabinet-description">作品、经历，与未完成的好奇心。</p>
        <button className="drawer-toggle" onClick={() => setOpened(o => !o)} aria-expanded={opened} aria-controls="drawer-contents">{opened ? <RotateCcw size={16}/> : <ArrowUpRight size={18}/>}<span>{opened ? '收起抽屉' : '打开我的抽屉'}</span><span className="mono">{opened ? 'CLOSE' : 'OPEN'}</span></button>
        <div className="cabinet-view-status" role="status" aria-live="polite">{busy ? '正在转换视角…' : opened ? '俯视档案 / 点击物品继续探索' : '点击抽屉把手，换个角度认识我'}</div>
        <div className="cabinet-side-note"><span className="mono">A SMALL SPACE.<br/>A WORLD OF IDEAS.</span><a href="mailto:948548474@qq.com?subject=你好，江南"><Mail size={14}/> 也可以先给我留句话 ↗</a></div>
      </div>
      <div className="cabinet-stage" aria-label="复古绿档案柜互动场景">
        <div className="cabinet-stage-index mono"><span>{opened ? 'VIEW 02 / INSIDE THE DRAWER' : 'VIEW 01 / THE DESIGN DESK'}</span><span>{theme === 'night' ? 'LAMP ON / NIGHT STUDY' : 'LAMP OFF / DAY STUDIO'}</span></div>
        <Suspense fallback={<div className="cabinet-loading mono">正在整理抽屉…</div>}><CabinetScene theme={theme} onThemeToggle={toggleTheme} opened={opened} busy={busy} onToggle={() => setOpened(o => !o)} onReady={setReady} onBusy={setBusy}/></Suspense>
        <button className="lamp-accessible-toggle" onClick={toggleTheme} aria-label={theme === 'night' ? '关闭台灯，切换白天模式' : '打开台灯，切换暗夜模式'} aria-pressed={theme === 'night'}>{theme === 'night' ? <Moon size={14}/> : <Sun size={14}/>}<span>{theme === 'night' ? '台灯已开启 · 关灯进入白天' : '台灯已关闭 · 开灯进入暗夜'}</span></button>
        <span className="cabinet-ground-label mono">EST. 2023 — IDEAS KEPT HERE.</span>
        {ready === false && <p className="cabinet-fallback-note">当前浏览器无法展示立体场景，可通过下方目录浏览全部内容。</p>}
      </div>
    </div>
    <div className="cabinet-directory" id="drawer-contents">
      <div className="directory-title"><span className="mono">CONTENTS / 抽屉目录</span><p>每一件物品，都是一个入口。</p></div>
      {items.map(([number, title, description, href]) => <a href={href} key={number}><span className="mono">{number}</span><div><strong>{title}</strong><span>{description}</span></div><ArrowUpRight size={16}/></a>)}
    </div>
    <div className="cabinet-bottomline mono"><span>VISUAL SYSTEMS / BRAND IDENTITY / GENERATIVE AI</span><a href="#work">向下浏览精选作品 <ArrowDownRight size={14}/></a></div>
  </section>;
}

export function Experiments() {
  const [active, setActive] = useState(null);
  return <section className="experiments section-pad" id="experiments" aria-labelledby="experiments-title">
    <div className="experiment-heading"><div><p className="mono">04 / FROM THE FLOPPY DISK</p><h2 id="experiments-title">好奇心，<span>持续存档。</span></h2></div><p>这里先收下三张个人图形练习。<br/>点击放大，看看想法的另一面。</p></div>
    <div className="experiment-grid">{[['signal', '视觉信号'], ['identity', '边界练习'], ['digital', '数字频率']].map(([name, title], index) => <button key={name} onClick={() => setActive({name, title})}><img src={`/studies/${name}.svg`} alt={title} loading="lazy"/><span><span className="mono">EXP. 0{index + 1}</span>{title}<ArrowUpRight size={16}/></span></button>)}</div>
    {active && <ExperimentDialog active={active} close={() => setActive(null)}/>}
  </section>;
}
function ExperimentDialog({ active, close }) {
  return <dialog open className="experiment-dialog" ref={node => { if (node && !node.dataset.initialized) { node.dataset.initialized = 'true'; node.close(); node.showModal(); } }} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }} aria-label={active.title}>
    <div><button autoFocus onClick={close} aria-label="关闭图形预览">关闭 ×</button><img src={`/studies/${active.name}.svg`} alt={active.title}/><p>{active.title} / PERSONAL VISUAL STUDY</p></div>
  </dialog>;
}
