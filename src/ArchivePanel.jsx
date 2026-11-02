import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ArrowUpRight, X } from 'lucide-react';

const titles = { work: '作品集', resume: '简历', skills: '技能卡', contact: '给江南留言' };

export default function ArchivePanel({ selection, onClose, projects, capabilities }) {
  const dialogRef = useRef(null);
  const contentRef = useRef(null);
  const scrollLockRef = useRef(null);
  const unlockScroll = () => {
    if (scrollLockRef.current !== null) {
      document.body.style.overflow = scrollLockRef.current;
      scrollLockRef.current = null;
    }
  };
  const { contextSafe } = useGSAP(() => {
    if (!selection) return;
    const dialog = dialogRef.current;
    if (scrollLockRef.current === null) scrollLockRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    gsap.fromTo(contentRef.current, { opacity: 0, y: 22 }, {
      opacity: 1, y: 0, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.45, ease: 'power3.out',
    });
    return () => {
      unlockScroll();
      if (dialog.open) dialog.close();
    };
  }, { scope: dialogRef, dependencies: [selection], revertOnUpdate: true });

  const dismiss = contextSafe(() => {
    gsap.to(contentRef.current, {
      opacity: 0, y: 12, overwrite: 'auto',
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.18,
      onComplete: () => { unlockScroll(); dialogRef.current?.close(); },
    });
  });

  return <dialog ref={dialogRef} className={`archive-panel archive-panel-${selection || 'closed'}`} aria-labelledby="archive-panel-title" onClose={() => { if (!dialogRef.current.open) { unlockScroll(); onClose(); } }} onCancel={(event) => { event.preventDefault(); dismiss(); }} onClick={(event) => {
    if (event.target !== dialogRef.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismiss();
  }}>
    <div ref={contentRef}>
      <header className="archive-panel-header">
        <div><p>江南的设计档案</p><h2 id="archive-panel-title">{titles[selection]}</h2></div>
        <button type="button" className="archive-panel-close" aria-label="关闭档案" onClick={dismiss}><X size={22}/></button>
      </header>
      <div className="archive-panel-body">
        {selection === 'work' && <>
          <p className="archive-panel-intro">从视觉语言到品牌与数字体验，收集一些持续探索的方向。</p>
          <div className="panel-projects">{projects.map((project) => <article key={project.no}>
            <img src={project.image} alt={project.title} loading="lazy"/>
            <small>{project.type}</small><h3>{project.title}</h3><p>{project.desc}</p>
            <a href={`mailto:948548474@qq.com?subject=${encodeURIComponent(`关于项目：${project.title}`)}`}>聊聊这个项目 <ArrowUpRight size={16}/></a>
          </article>)}</div>
        </>}
        {selection === 'resume' && <div className="panel-resume">
          <div className="resume-heading"><div><h3>江南</h3><p>视觉设计 / 品牌设计 / AI 创意</p><a href="mailto:948548474@qq.com">948548474@qq.com</a></div><div className="resume-actions"><a className="resume-print" href={`${import.meta.env.BASE_URL}resume/jiangnan-resume.pdf`} download>下载简历 PDF <ArrowUpRight size={16}/></a><button type="button" className="resume-print" onClick={() => window.print()}>打印简历</button></div></div>
          <p>毕业于武汉纺织大学数字媒体艺术专业，拥有视觉设计、品牌表达与 AI 视觉探索经验。关注从业务需求出发，将创意概念转化为有识别度、可落地的视觉方案。</p>
          <h4>工作经历</h4>
          <article><small>2025.03 — 至今</small><h5>百度文库 · 视觉设计师</h5><p>参与海报与活动视觉设计、AI 风格模型探索及多场景内容视觉支持，推动视觉资产沉淀与团队协作效率提升。</p></article>
          <article><small>2023.04 — 2024.07</small><h5>武汉禾中济网络科技有限公司 · UI 设计师</h5><p>负责页面组件视觉化、官网版式与运营视觉设计，通过用户行为分析优化界面布局及操作体验。</p></article>
          <h4>教育经历</h4><article><small>2017.09 — 2021.06</small><h5>武汉纺织大学 · 数字媒体艺术 · 本科</h5><p>获得 2018 年中国大学生广告艺术节学院奖优秀奖。</p></article>
        </div>}
        {selection === 'skills' && <><p className="archive-panel-intro">从概念探索到视觉落地，连接设计方法与创作工具。</p><div className="panel-skills">{capabilities.map((item) => <article key={item.n}><small>{item.n} / {item.en}</small><h3>{item.title}</h3><p>{item.copy}</p><ul>{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></article>)}</div></>}
        {selection === 'contact' && <div className="panel-contact"><p>有个有趣的想法，想一起实现？<br/>合作、项目咨询，或只想聊聊设计，都欢迎写信。</p><a className="archive-open" href="mailto:948548474@qq.com?subject=%E7%BB%99%E6%B1%9F%E5%8D%97%E7%95%99%E8%A8%80">948548474@qq.com <ArrowUpRight size={18}/></a></div>}
      </div>
    </div>
  </dialog>;
}
