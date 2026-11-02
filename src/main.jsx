import React, { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowDownRight, ArrowUpRight, ArrowRight, Menu, X, MoveUpRight } from 'lucide-react';
import './styles.css';
import ArchivePanel from './ArchivePanel.jsx';

gsap.registerPlugin(useGSAP);
// Keep interaction duration consistent when a graphics frame takes longer to render.
gsap.ticker.lagSmoothing(0);

const ArchiveScene = lazy(() => import('./ArchiveScene.jsx'));

const projects = [
  {
    no: '01', type: 'AI VISUAL SYSTEM · 2025', title: 'LoRA / 视觉的另一种可能',
    desc: '为品牌与内容团队构建可复用的 AI 视觉语言。', year: '2025',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85',
    className: 'project-one', tag: 'GEN AI'
  },
  {
    no: '02', type: 'BRAND IDENTITY · 2024', title: '未定义的边界',
    desc: '以秩序、留白与动态符号，建立新锐文化品牌的识别系统。', year: '2024',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1600&q=85',
    className: 'project-two', tag: 'IDENTITY'
  },
  {
    no: '03', type: 'DIGITAL EXPERIENCE · 2024', title: '感知正在发生',
    desc: '从界面到动效，探索数字产品中更有温度的交互体验。', year: '2024',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=85',
    className: 'project-three', tag: 'DIGITAL'
  }
];

const capabilities = [
  { n: '01', title: '视觉系统', en: 'VISUAL SYSTEM', copy: '从概念探索到视觉落地，建立清晰、一致、可延展的设计语言。', tags: ['Art Direction', 'Graphic', 'Motion'] },
  { n: '02', title: 'AI 创意设计', en: 'GENERATIVE AI', copy: '将生成式工具融入创意流程，探索新的图像表达与生产方式。', tags: ['ComfyUI', 'LoRA', 'Prompt Design'] },
  { n: '03', title: '品牌设计', en: 'BRAND IDENTITY', copy: '以策略和视觉为基础，让品牌在不同触点中保持独特而统一。', tags: ['Identity', 'Campaign', 'Guideline'] },
  { n: '04', title: '数字体验', en: 'DIGITAL EXPERIENCE', copy: '兼顾体验逻辑与视觉细节，连接产品目标和真实用户需求。', tags: ['UI Design', 'Figma', 'Prototyping'] }
];

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="nav">
    <a className="wordmark" href="#top" onClick={close}>JN<span>®</span></a>
    <div className={`nav-links ${open ? 'is-open' : ''}`}>
      <a href="#work" onClick={close}>作品</a>
      <a href="#about" onClick={close}>关于</a>
      <a href="#capabilities" onClick={close}>能力</a>
    </div>
    <a className="nav-contact" href="#contact">联系我 <ArrowUpRight size={15}/></a>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="切换导航">{open ? <X/> : <Menu/>}</button>
  </header>;
}

function Hero() {
  const heroRef = useRef(null);
  const typeRef = useRef(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFallback, setSceneFallback] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [archiveRevealed, setArchiveRevealed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const toggleDrawer = useCallback(() => {
    setArchiveRevealed(false);
    setTransitioning(true);
    setDrawerOpen((value) => !value);
  }, []);
  const handleTransitionEnd = useCallback((opened) => {
    setTransitioning(false);
    setArchiveRevealed(opened);
  }, []);
  const closeFolder = useCallback(() => setSelectedFolder(null), []);
  const handleSceneReady = useCallback((ready, status) => {
    setSceneReady(ready);
    setSceneFallback(status === 'fallback');
  }, []);

  useGSAP(() => {
    const hero = heroRef.current;
    const type = typeRef.current;
    const media = gsap.matchMedia();
    let disposed = false;
    const letteringMetrics = document.createElement('canvas').getContext('2d');
    const fitLettering = () => {
      if (disposed) return;
      if (!letteringMetrics) return;
      let style = getComputedStyle(type);
      const measure = () => {
        letteringMetrics.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        return letteringMetrics.measureText('Portfolio');
      };
      let metrics = measure();
      const inkWidth = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
      if (!inkWidth) return;
      type.style.fontSize = `${parseFloat(style.fontSize) * hero.clientWidth * 0.93 / inkWidth}px`;
      style = getComputedStyle(type); metrics = measure();
      const stageLeft = type.parentElement.getBoundingClientRect().left - hero.getBoundingClientRect().left;
      type.style.left = `${hero.clientWidth * 0.0365 + metrics.actualBoundingBoxLeft - stageLeft}px`;
      if (hero.clientWidth > 760) {
        const baseline = (parseFloat(style.lineHeight) - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent;
        type.style.top = `${hero.clientHeight * 0.139 - baseline + metrics.actualBoundingBoxAscent}px`;
      } else type.style.removeProperty('top');
    };
    const letteringObserver = new ResizeObserver(fitLettering);
    letteringObserver.observe(hero);
    document.fonts.ready.then(fitLettering);
    document.fonts.addEventListener('loadingdone', fitLettering);

    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      // Animate the light only, keeping the artwork and text layout stable.
      const lightX = gsap.quickTo(type, '--light-x', { duration: 0.9, ease: 'power3.out' });
      const lightY = gsap.quickTo(type, '--light-y', { duration: 0.9, ease: 'power3.out' });
      const glowX = gsap.quickTo(type, '--glow-x', { duration: 1.1, ease: 'power3.out' });
      const glowY = gsap.quickTo(type, '--glow-y', { duration: 1.1, ease: 'power3.out' });
      const move = (event) => {
        const rect = type.getBoundingClientRect();
        const x = gsap.utils.clamp(0, 100, (event.clientX - rect.left) / rect.width * 100);
        const y = gsap.utils.clamp(0, 100, (event.clientY - rect.top) / rect.height * 100);
        lightX(x); lightY(y);
        glowX((x - 50) * 0.12); glowY((y - 50) * 0.08);
      };
      const reset = () => {
        lightX(50); lightY(45); glowX(0); glowY(0);
      };
      hero.addEventListener('pointermove', move);
      hero.addEventListener('pointerleave', reset);
      hero.addEventListener('pointercancel', reset);
      window.addEventListener('blur', reset);
      return () => {
        hero.removeEventListener('pointermove', move);
        hero.removeEventListener('pointerleave', reset);
        hero.removeEventListener('pointercancel', reset);
        window.removeEventListener('blur', reset);
      };
    });
    return () => {
      disposed = true;
      letteringObserver.disconnect();
      document.fonts.removeEventListener('loadingdone', fitLettering);
      type.style.removeProperty('font-size');
      type.style.removeProperty('left');
      type.style.removeProperty('top');
      media.revert();
    };
  }, { scope: heroRef });

  return <><section className={`hero archive-hero ${drawerOpen ? 'is-exploring' : ''}`} id="top" ref={heroRef} aria-labelledby="archive-title">
    <div className="archive-shell">
    <div className="archive-stage">
      <div className="archive-type" ref={typeRef} aria-hidden="true">
        Portfolio<span className="archive-type-light" aria-hidden="true">Portfolio</span>
      </div>
      <div id="archive-model" className={`archive-visual ${sceneReady ? 'is-ready' : ''}`} role="group" aria-label="墨绿色设计档案柜，包含作品集、简历和技能卡" aria-busy={!sceneReady && !sceneFallback}>
        <img className="archive-poster" src={`${import.meta.env.BASE_URL}models/portfolio-archive-poster.webp`} alt="墨绿色金属档案柜与橙红色关节台灯" fetchPriority="high" decoding="async" />
        <Suspense fallback={null}>
          <ArchiveScene open={drawerOpen} onToggle={toggleDrawer} onReady={handleSceneReady} onTransitionEnd={handleTransitionEnd} onSelectFolder={setSelectedFolder}/>
        </Suspense>
        <span className="scene-hint" aria-live="polite">{sceneReady ? drawerOpen ? '档案已展开，慢慢翻阅。' : '点击拉手，打开档案。' : sceneFallback ? '向下探索，看看我的作品。' : '正在整理档案…'}</span>
      </div>
    </div>
    <div className="archive-caption">
      <div><h1 className="archive-title" id="archive-title">江南的<br/>设计抽屉<span>。</span></h1><p className="archive-description">收藏作品，也收藏好奇心。</p>
      <div className="archive-actions">
        {sceneFallback ? <a className="archive-open" href="#work">浏览精选作品 <ArrowUpRight size={17}/></a> : <><button className="archive-open" type="button" onClick={toggleDrawer} disabled={!sceneReady} aria-expanded={drawerOpen} aria-controls="archive-model">{drawerOpen ? '收起设计抽屉' : '打开设计抽屉'} <ArrowUpRight size={17}/></button><a className="archive-browse" href="#work">查看作品 <ArrowDownRight size={16}/></a></>}
      </div></div>
    </div>
    {drawerOpen && <div className="archive-explore-bar"><button type="button" onClick={toggleDrawer}>← 返回首页</button><p aria-live="polite">{transitioning ? '正在展开设计档案…' : '选择一份档案，慢慢翻阅。'}</p></div>}
    {drawerOpen && archiveRevealed && !transitioning && <nav className="archive-folder-links" aria-label="抽屉里的档案">
      <button type="button" onClick={() => setSelectedFolder('work')}><small>01</small><strong>作品集</strong><span>精选项目</span></button>
      <button type="button" onClick={() => setSelectedFolder('resume')}><small>02</small><strong>简历</strong><span>经历与背景</span></button>
      <button type="button" onClick={() => setSelectedFolder('skills')}><small>03</small><strong>技能卡</strong><span>方法与工具</span></button>
    </nav>}
    </div>
  </section><nav className="archive-foot" aria-label="首页快捷入口"><a href="#work">精选作品 <ArrowUpRight size={15}/></a><a href="#about">关于江南 <ArrowUpRight size={15}/></a></nav><ArchivePanel selection={selectedFolder} onClose={closeFolder} projects={projects} capabilities={capabilities}/></>;
}

function SectionHead({ index, title, sub, note }) {
  return <div className="section-head">
    <div className="section-index"><span>{index}</span><span className="tiny-line"/></div>
    <div className="section-heading"><h2>{title}</h2><p>{sub}</p></div>
    {note && <p className="section-note">{note}</p>}
  </div>;
}

function Work() {
  return <section className="work section-pad" id="work">
    <SectionHead index="01 / SELECTED WORK" title={<>精选<br/><span>项目。</span></>} sub="SELECTED PROJECTS" note="以视觉为起点，连接品牌、内容与体验。"/>
    <div className="project-list">
      {projects.map((p) => <article className={`project-card ${p.className}`} key={p.no}>
        <a className="project-image" href="#contact" aria-label={`咨询项目：${p.title}`}>
          <img src={p.image} alt={p.title} loading="lazy"/>
          <span className="project-tag">{p.tag}</span>
          <span className="project-arrow"><ArrowUpRight size={23}/></span>
          <span className="image-grain"/>
        </a>
        <div className="project-info">
          <div className="project-no">{p.no} <span>—</span> {p.type}</div>
          <div className="project-title"><h3>{p.title}</h3><p>{p.desc}</p></div>
          <span className="project-year">{p.year}</span>
        </div>
      </article>)}
    </div>
    <div className="work-foot"><span>MORE WORKS ARE IN PROGRESS</span><span>更多项目，持续更新中 ↗</span></div>
  </section>;
}

function About() {
  return <section className="about section-pad" id="about">
    <SectionHead index="02 / A LITTLE ABOUT ME" title={<>关于<br/><span>江南。</span></>} sub="PROFILE & PRACTICE" note="好设计不是装饰，而是把复杂的事讲清楚。"/>
    <div className="about-grid">
      <div className="portrait-wrap">
        <img src="/profile.png" alt="江南个人照片" loading="lazy"/>
        <div className="portrait-caption"><span>JIANG NAN</span><span>VISUAL THINKER / 1999</span></div>
        <div className="portrait-stamp">JN<br/><span>DESIGN<br/>PRACTICE</span></div>
      </div>
      <div className="about-copy">
        <p className="about-lead">你好，我是江南。<br/><span>让视觉拥有观点，</span><br/>让创意真正发生。</p>
        <p className="about-body">毕业于武汉纺织大学数字媒体艺术专业，拥有视觉设计、品牌表达与 AI 视觉探索经验。曾参与百度文库相关视觉项目及数字产品设计，擅长从业务需求出发，将创意概念转化为有识别度、可落地的视觉方案。</p>
        <p className="about-body">我关注设计与新技术之间的关系，也相信克制的表达、清晰的逻辑和对细节的坚持，能让作品在快速变化的媒介中保持力量。</p>
        <div className="about-contact"><a href="mailto:948548474@qq.com">948548474@qq.com <MoveUpRight size={16}/></a><span>BEIJING, CHINA · UTC+8</span></div>
      </div>
      <div className="stats">
        <div className="stat"><strong>03<span>+</span></strong><span>YEARS IN DESIGN</span></div>
        <div className="stat"><strong>04</strong><span>CORE DISCIPLINES</span></div>
        <div className="stat"><strong>∞</strong><span>WAYS TO EXPLORE</span></div>
      </div>
    </div>
    <div className="timeline">
      <div className="timeline-label">EXPERIENCE <span>经历</span></div>
      <div className="timeline-row"><span className="timeline-date">2025.03 — NOW</span><div><h3>百度文库 <span>视觉设计师</span></h3><p>参与海报与活动视觉设计、AI 风格模型探索及多场景内容视觉支持，推动视觉资产沉淀与团队协作效率提升。</p></div></div>
      <div className="timeline-row"><span className="timeline-date">2023.04 — 2024.07</span><div><h3>武汉禾中济网络科技有限公司 <span>UI 设计师</span></h3><p>负责页面组件视觉化、官网版式与运营视觉设计，通过用户行为分析优化界面布局及操作体验。</p></div></div>
      <div className="timeline-row"><span className="timeline-date">2017.09 — 2021.06</span><div><h3>武汉纺织大学 <span>数字媒体艺术 · 本科</span></h3><p>参与校园艺术活动与视觉传播实践，获得 2018 年中国大学生广告艺术节学院奖优秀奖。</p></div></div>
    </div>
  </section>;
}

function Capabilities() {
  return <section className="capabilities section-pad" id="capabilities">
    <SectionHead index="03 / WHAT I DO" title={<>能力与<br/><span>方法。</span></>} sub="CAPABILITIES" note="从概念到执行，保持好奇，也保持判断。"/>
    <div className="cap-grid">
      {capabilities.map((c) => <article className="cap-card" key={c.n}>
        <div className="cap-top"><span>{c.n}</span><ArrowUpRight size={19}/></div>
        <div className="cap-main"><p>{c.en}</p><h3>{c.title}</h3><span className="cap-rule"/></div>
        <p className="cap-copy">{c.copy}</p>
        <div className="cap-tags">{c.tags.map(t => <span key={t}>{t}</span>)}</div>
      </article>)}
    </div>
    <div className="tool-row"><span>TOOLS I WORK WITH</span><div>FIGMA <i/> PHOTOSHOP <i/> ILLUSTRATOR <i/> C4D <i/> COMFYUI <i/> AFTER EFFECTS</div></div>
  </section>;
}

function Contact() {
  return <footer className="contact section-pad" id="contact">
    <div className="contact-top"><span>04 / HAVE A GOOD IDEA?</span><span>OPEN FOR SELECT PROJECTS · 2026</span></div>
    <div className="contact-main">
      <p className="eyebrow"><span className="live-dot"/> LET'S MAKE SOMETHING MEANINGFUL</p>
      <h2>让我们<br/><em>开始吧。</em></h2>
      <a className="contact-cta" href="mailto:948548474@qq.com"><span>聊聊你的项目</span><ArrowUpRight size={24}/></a>
    </div>
    <div className="contact-bottom">
      <a className="footer-mail" href="mailto:948548474@qq.com">948548474@qq.com <ArrowUpRight size={15}/></a>
      <div className="social-links"><a href="https://www.behance.net/" target="_blank" rel="noreferrer">BEHANCE <ArrowUpRight size={13}/></a><a href="https://www.xiaohongshu.com/" target="_blank" rel="noreferrer">REDNOTE <ArrowUpRight size={13}/></a></div>
      <span>© 2026 JIANG NAN. BUILT WITH INTENTION.</span>
      <a className="back-top" href="#top">BACK TO TOP ↑</a>
    </div>
    <div className="contact-watermark" aria-hidden="true">JN.</div>
  </footer>;
}

function App() {
  return <><Header/><main><Hero/><Work/><About/><Capabilities/></main><Contact/></>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
