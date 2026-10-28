import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownRight, ArrowUpRight, ArrowRight, Menu, X, MoveUpRight } from 'lucide-react';
import './styles.css';

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
      <a href="#work" onClick={close}>作品 <span>01</span></a>
      <a href="#about" onClick={close}>关于 <span>02</span></a>
      <a href="#capabilities" onClick={close}>能力 <span>03</span></a>
    </div>
    <a className="nav-contact" href="#contact">联系我 <ArrowUpRight size={15}/></a>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="切换导航">{open ? <X/> : <Menu/>}</button>
  </header>;
}

function Hero() {
  return <section className="hero" id="top">
    <video className="hero-video" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2000&q=80">
      <source src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_25fps.mp4" type="video/mp4" />
    </video>
    <div className="hero-shade"/>
    <div className="hero-meta"><span>INDEPENDENT DESIGN PRACTICE</span><span>BEIJING, CN / AVAILABLE WORLDWIDE</span></div>
    <div className="hero-title-wrap">
      <p className="eyebrow"><span className="live-dot"/> 视觉设计师 / AI 设计师 / 品牌设计师</p>
      <h1>设计不止于<br/><em>看见。</em></h1>
      <div className="hero-bottom">
        <p>用视觉建立感知，<br/>用技术打开想象。</p>
        <a className="round-link" href="#work" aria-label="查看精选作品"><ArrowDownRight size={24}/></a>
      </div>
    </div>
    <div className="hero-index"><span>SCROLL TO EXPLORE</span><span>© 2026 JIANG NAN</span></div>
    <div className="hero-orbit" aria-hidden="true"><span/><span/><span/></div>
  </section>;
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
