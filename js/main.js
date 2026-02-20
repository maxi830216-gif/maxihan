/* ========================================
   Main JS — Maxihan Profile
   ======================================== */

// --- Dark Mode ---
const initTheme = () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }

  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      themeToggle.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeToggle.textContent = '☀️';
    }
  });
};

// --- Custom Cursor ---
const initCursor = () => {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  // Only init if pointer is fine (not touch)
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // Use requestAnimationFrame for smooth cursor movement
  const animateCursor = () => {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Add hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .nav-link, .modal-close');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  // Add special hover effect for project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => cursor.classList.add('hovering-project'));
    card.addEventListener('mouseleave', () => cursor.classList.remove('hovering-project'));
  });
};

// --- Timeline Scroll Animation ---
const initTimeline = () => {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const updateTimeline = () => {
    const rect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    let progress = 0;
    const startPoint = windowHeight * 0.8;

    if (rect.top < startPoint) {
      const scrollableDistance = rect.height;
      const scrolled = startPoint - rect.top;
      progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
    }

    timeline.style.setProperty('--scroll-height', `${progress * 100}%`);
  };

  window.addEventListener('scroll', updateTimeline, { passive: true });
  // Initial calculation
  setTimeout(updateTimeline, 100);
};


// --- Scroll Reveal ---
const revealElements = () => {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
};

// --- Navigation Active State ---
const initNavigation = () => {
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('[data-section]');

  // Scroll effect on nav
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Active section highlight
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.dataset.section;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.nav === sectionId);
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-100px 0px -100px 0px'
  });

  sections.forEach(section => sectionObserver.observe(section));

  // Click navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.nav;
      const targetSection = document.querySelector(`[data-section="${targetId}"]`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
};

// --- Project Modal ---
const initModal = () => {
  const overlay = document.querySelector('.modal-overlay');
  const modal = document.querySelector('.modal');
  const modalBody = document.querySelector('.modal-body');
  const projectCards = document.querySelectorAll('.project-card');

  const projectData = getProjectData();

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.dataset.project;
      const project = projectData[projectId];
      if (project) {
        renderModal(project, card);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderModal(project, card) {
    const bgColor = getComputedStyle(card).backgroundColor;
    modalBody.innerHTML = `
      <button class="modal-close" onclick="document.querySelector('.modal-overlay').classList.remove('active'); document.body.style.overflow='';">✕</button>
      <span class="modal-badge" style="background: ${bgColor}; color: var(--color-text-primary);">${project.category}</span>
      <h2 class="modal-title">${project.title}</h2>
      <p class="modal-oneliner">${project.oneliner}</p>
      ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener" class="modal-link-btn">바로가기 →</a>` : ''}

      <div class="modal-section">
        <h3 class="modal-section-title">개발 동기</h3>
        <div class="modal-text">${project.motivation}</div>
      </div>

      <div class="modal-section">
        <h3 class="modal-section-title">기술 스택</h3>
        <div class="tech-stack-grid">
          ${project.techStack.map(t => `
            <div class="tech-stack-item">
              <div class="tech-stack-item-label">${t.category}</div>
              <div class="tech-stack-item-value">${t.tech}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-section">
        <h3 class="modal-section-title">핵심 기능</h3>
        <div class="features-grid">
          ${project.features.map(f => `
            <div class="feature-item">
              <div class="feature-item-title">${f.title}</div>
              <div class="feature-item-desc">${f.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-section">
        <h3 class="modal-section-title">시스템 아키텍처</h3>
        <div class="architecture-diagram"><img src="${project.architecture}" alt="${project.title} System Architecture" style="width:100%;border-radius:12px;"></div>
      </div>

      <div class="modal-section">
        <h3 class="modal-section-title">주요 성과</h3>
        <div class="modal-text">
          <ul>${project.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
      </div>
    `;
  }
};

// --- Project Data ---
function getProjectData() {
  return {
    aptdeal: {
      category: 'REAL ESTATE · DATA PLATFORM',
      title: 'APT DEAL',
      oneliner: '전국 아파트 실거래가를 지도 기반으로 분석하고 시각화하는 부동산 데이터 플랫폼',
      motivation: `<ul>
        <li>기존 부동산 플랫폼의 데이터 신뢰성 부족과 사용자 경험 한계를 해결하고자 시작</li>
        <li>공공 데이터의 신뢰성을 유지하면서 직관적인 UX와 자동화된 데이터 파이프라인을 갖춘 실거래가 플랫폼 설계</li>
        <li>풀스택 개발 역량을 종합적으로 발휘하는 실전 프로젝트로 활용</li>
      </ul>`,
      techStack: [
        { category: 'Frontend', tech: 'Next.js 15, React 19, TypeScript' },
        { category: 'UI / Styling', tech: 'Tailwind CSS 4, ShadCN UI, Radix UI' },
        { category: 'Charts', tech: 'Recharts, Chart.js' },
        { category: 'Map', tech: 'Kakao Map API' },
        { category: 'Backend', tech: 'Express.js 5, Node.js 18+' },
        { category: 'Database', tech: 'MySQL 8.0' },
        { category: 'Data Pipeline', tech: '공공데이터포탈 API, fast-xml-parser' },
        { category: 'Deploy', tech: 'Vercel, AppPass' },
        { category: 'SEO', tech: 'Google Search Console, Sitemap' },
      ],
      features: [
        { icon: '🗺️', title: '지도 기반 탐색', desc: '카카오맵 연동으로 전국 아파트를 마커/클러스터로 시각화, 줌 레벨별 자동 전환' },
        { icon: '📊', title: '실거래가 분석', desc: '매매·전세·월세 통합 조회, 단지+면적별 가격 추이 인터랙티브 차트' },
        { icon: '🔍', title: '통합 검색', desc: '단지명·주소 기반 실시간 자동완성, 검색 인덱스 기반 빠른 응답' },
        { icon: '⚙️', title: 'ETL 파이프라인', desc: '22단계 데이터 로더로 수집→검증→복구→동기화→캐싱 100% 자동화' },
        { icon: '📱', title: '반응형 UI', desc: '모바일 최적화 레이아웃, 다크/라이트 모드, 카드형/테이블형 전환' },
        { icon: '🌐', title: 'SEO 최적화', desc: '동적 Sitemap, SSR 메타태그, Google 검색 노출' },
      ],
      link: 'https://www.aptdeal.co.kr/',
      architecture: 'assets/images/aptdeal_arch.png',
      achievements: [
        '전국 아파트 매매/전월세 약 10년치 거래 데이터 자동 수집 및 관리',
        '22단계 ETL 파이프라인 구축으로 일일 데이터 동기화 100% 자동화',
        '카카오맵 + 주소 매칭 + 건축년도 검증 다중 소스 크로스 검증 체계',
        '공공 API 직접 호출 대비 응답 속도 대폭 개선 (수초 → 수백ms)',
        '동적 Sitemap + SSR 메타태그로 Google 검색 노출 달성',
      ]
    },

    maxitester: {
      category: 'NO-CODE · TESTING PLATFORM',
      title: 'Maxi Tester',
      oneliner: '코딩 없이 클릭만으로 웹 테스트를 설계·실행·리포팅하는 자동화 테스팅 플랫폼',
      motivation: `<ul>
        <li>QA 현장에서 반복적인 수동 테스트에 소요되는 시간과 비용 문제를 경험</li>
        <li>기존 도구(Selenium, Cypress)는 코딩 지식이 필수라 비개발 직군의 활용이 어려움</li>
        <li>"클릭만으로 테스트를 만든다"는 콘셉트로 코드 없이 정교한 웹 자동화 테스트를 목표</li>
        <li>로컬 설계(Electron) + 서버 실행(Playwright) 이원 구조로 CI/CD 통합  모델 설계</li>
      </ul>`,
      techStack: [
        { category: 'Desktop Client', tech: 'Electron 40 + React 19 + TypeScript + Vite 7' },
        { category: 'UI Components', tech: 'shadcn/ui (Radix UI) + Tailwind CSS 4' },
        { category: 'State Management', tech: 'Zustand + TanStack React Query' },
        { category: 'Backend', tech: 'Ruby on Rails 8 (API Mode) + SQLite' },
        { category: 'Test Engine', tech: 'Playwright 1.58 (Headless Chromium)' },
        { category: 'Admin', tech: 'React 19 + Vite + Recharts' },
        { category: 'Build', tech: 'electron-builder (macOS)' },
        { category: 'Auth', tech: 'JWT (Access + Refresh Token)' },
        { category: 'Other', tech: 'IPC, Shadow DOM, AES-256, WebSocket' },
      ],
      features: [
        { icon: '🖱️', title: '노코드 테스트 설계', desc: '웹에서 클릭만으로 자동 스텝 등록, 드래그 & 드롭 순서 변경' },
        { icon: '🎯', title: '25종 테스트 액션', desc: 'Click, Input, Scroll, Assert, API Request 등 25가지 액션 타입' },
        { icon: '🧠', title: '스마트 셀렉터', desc: '3단계 Fallback으로 UI 변경에도 안정적 요소 탐지' },
        { icon: '📱', title: '모바일 에뮬레이션', desc: 'iPhone, Galaxy, iPad 등 기기 프로필 + Touch 에뮬레이션' },
        { icon: '🔄', title: 'Data-Driven 테스트', desc: '하나의 스텝에 여러 데이터셋 매핑으로 반복 검증' },
        { icon: '📋', title: '리포팅 시스템', desc: 'Pass/Fail 상세 결과 + 실패 스크린샷 + PDF/Web 리포트' },
      ],
      link: 'http://61.107.200.30:4003/',
      architecture: 'assets/images/maxitester_arch.png',
      achievements: [
        '25종 테스트 액션 타입과 3단계 스마트 셀렉터 엔진 구현',
        'Electron + Rails + Playwright 3티어 아키텍처 설계',
        'macOS 데스크톱 빌드 (Windows/Linux 지원 예정)',
        '스텝별 Pass/Fail + 자동 스크린샷 캡처 리포팅 시스템',
        'API Token 기반 CI/CD 연동 (GitHub Actions, Jenkins)',
        '다중 사용자/조직 관리 Admin 백오피스 구축',
      ]
    },

    autotrading: {
      category: 'FINTECH · TRADING BOT',
      title: 'Auto Trading',
      oneliner: '기술적 분석 이론을 코드로 구현한 암호화폐 자동매매 시스템 (Upbit/Bybit)',
      motivation: `<ul>
        <li>감정에 좌우되는 개인 매매의 한계를 기술적 분석 자동화로 해결하고자 시작</li>
        <li>Upbit(현물) + Bybit(선물) 동시 운용으로 롱/숏 양방향 매매 시스템 구축</li>
        <li>Python 비동기 처리, REST API 설계, React SPA 등 풀스택 역량 통합 프로젝트</li>
      </ul>`,
      techStack: [
        { category: 'Backend', tech: 'Python 3.11 · FastAPI · Uvicorn' },
        { category: 'Scheduler', tech: 'APScheduler (비동기)' },
        { category: 'Frontend', tech: 'Next.js 16 · React 19 · TypeScript' },
        { category: 'Database', tech: 'SQLAlchemy + SQLite' },
        { category: 'Exchange API', tech: 'pyupbit · pybit · httpx' },
        { category: 'Analysis', tech: 'ta · pandas · numpy' },
        { category: 'Notification', tech: 'python-telegram-bot (v20+ Async)' },
        { category: 'Deploy', tech: 'Elice Cloud VM · rsync · SSH' },
      ],
      features: [
        { icon: '📈', title: '10+ 매매 전략', desc: 'Morning Star, Harmonic, RSI Divergence 등 롱/숏 10종 이상' },
        { icon: '🔄', title: '멀티 거래소', desc: 'Upbit 현물 + Bybit 선물 독립 스케줄러 병렬 운영' },
        { icon: '🛡️', title: '리스크 관리', desc: '트레일링 SL/TP, 2단계 익절, 중복 매수 방지, 긴급 청산' },
        { icon: '📊', title: '실시간 대시보드', desc: '포지션 현황, 누적 수익률, 거래 히스토리 시각화' },
        { icon: '🔔', title: 'Telegram 알림', desc: '매매 체결, 프리뷰, 트레일링 업데이트, 시스템 상태 실시간' },
        { icon: '🔐', title: '다중 사용자', desc: 'JWT 인증, 사용자별 독립 설정, API 키 암호화' },
      ],
      link: 'http://61.107.200.30:3001/',
      architecture: 'assets/images/autotrading_arch.png',
      achievements: [
        '10종 이상 기술적 분석 전략 Python 자체 구현',
        '비동기 스케줄러 기반 Upbit/Bybit 병렬 운영 아키텍처',
        'FastAPI + Next.js 풀스택으로 RESTful API 40개+ 설계',
        '트레일링 SL/TP 알고리즘으로 수익 극대화/손실 최소화',
        '시뮬레이션 + 실거래 동시 운용 프로세스 확립',
      ]
    },

    autotcgen: {
      category: 'AI · QA AUTOMATION',
      title: 'AutoTC-Gen',
      oneliner: '기획서(PPT/PDF/DOCX/Figma)를 업로드하면 AI가 테스트 케이스를 자동 생성하는 QA 자동화 플랫폼',
      motivation: `<ul>
        <li>기획서를 수동으로 검토하며 TC 작성하는 과정이 반복적이고 작성자 숙련도에 따라 품질 편차 발생</li>
        <li>PPT·PDF·DOCX 등 다양한 포맷의 기획서를 일일이 분석하여 TC 도출에 프로젝트당 수일 소요</li>
        <li>AI/ML 기술을 활용해 표준 테스트 기법(경계값, 동등분할, 상태전이)을 자동 적용하는 TC 생성 시스템</li>
      </ul>`,
      techStack: [
        { category: 'Backend', tech: 'FastAPI (Python 3.11+)' },
        { category: 'Frontend', tech: 'React 18 + Vite + TypeScript' },
        { category: 'Desktop', tech: 'Electron 33' },
        { category: 'Mobile', tech: 'Capacitor (iOS/Android)' },
        { category: 'Database', tech: 'PostgreSQL 15 + SQLAlchemy' },
        { category: 'OCR', tech: 'EasyOCR (한국어/영어)' },
        { category: 'NLP', tech: 'SpaCy 3.7 + NER Engine' },
        { category: 'Vision AI', tech: 'YOLOv8 + Qwen-VL' },
        { category: 'LLM', tech: 'Ollama (Local LLM)' },
        { category: 'ML', tech: 'PyTorch + Transformers (BERT)' },
      ],
      features: [
        { icon: '📄', title: '다중 포맷 파싱', desc: 'PPT, PDF, DOCX, Figma 자동 인식 + OCR 텍스트 추출' },
        { icon: '🤖', title: 'AI 분석 엔진', desc: 'NER + YOLOv8 + Qwen-VL + BERT으로 기획서 지능형 분석' },
        { icon: '🧪', title: 'TC 자동 생성', desc: '경계값·동등분할·상태전이 등 5개 표준 기법 자동 적용' },
        { icon: '📊', title: '프로젝트 관리', desc: '문서·TC 통합 대시보드, Excel 내보내기, QA 리포트' },
        { icon: '🔄', title: '변경 추적', desc: 'Diff Engine으로 기획서 변경 시 영향 분석 및 TC 자동 갱신' },
        { icon: '📱', title: '크로스플랫폼', desc: '웹 + 데스크톱(Electron) + 모바일(Capacitor) 동시 지원' },
      ],
      link: 'http://61.107.200.30:3000/',
      architecture: 'assets/images/autotcgen_arch.png',
      achievements: [
        'TC 작성 시간 약 90% 단축 (4~8시간 → 10~30분)',
        'OCR + NLP + Vision AI + LLM 통합 멀티모달 파이프라인 구축',
        'Smart Router: 문서 특성별 최적 파싱 전략 동적 선택',
        '규칙 기반 + AI 기반 하이브리드 TC 생성 엔진',
        '웹 + 데스크톱 + 모바일 크로스플랫폼 React 통합 아키텍처',
      ]
    },

    deepsmock: {
      category: 'BLOCKCHAIN · B2B PLATFORM',
      title: 'Deeps Mock',
      oneliner: 'B2B 플랫폼(Deeps)의 계정 연동, 퀘스트 동기화를 실전 검증하는 테스트 앱 + 블록체인 결제 통합',
      motivation: `<ul>
        <li>자사 B2B 플랫폼(Deeps)의 API 및 연동 플로우를 실제 서비스 환경에서 검증 필요</li>
        <li>외부 게임사 시나리오(로그인 → 계정 연동 → 퀘스트 → 보상)를 시뮬레이션</li>
        <li>테트리스 게임 + Circle USDC 블록체인 결제를 확장 통합한 풀스택 프로젝트</li>
      </ul>`,
      techStack: [
        { category: 'Frontend', tech: 'Next.js 16, React 19, TypeScript 5' },
        { category: 'UI', tech: 'Tailwind CSS 4, ShadCN UI, Radix UI' },
        { category: 'Backend', tech: 'Next.js API Routes (App Router)' },
        { category: 'Database', tech: 'MySQL 8 + Prisma ORM 6' },
        { category: 'Blockchain', tech: 'Circle USDC, Polygon (MATIC-AMOY)' },
        { category: 'Web3', tech: 'wagmi 3, viem 2, ConnectKit, MetaMask SDK' },
      ],
      features: [
        { icon: '🔗', title: 'B2B 계정 연동', desc: 'UUID 임시 코드 기반 계정 연동 + S2S 통신 검증' },
        { icon: '🏆', title: '퀘스트 동기화', desc: '6종 퀘스트 수행, 자동 진행도 업데이트 및 보상 검증' },
        { icon: '🎮', title: '테트리스 게임', desc: '완전한 게임 엔진으로 퀘스트 진행도 자연스러운 테스트' },
        { icon: '💳', title: 'USDC 결제', desc: 'Circle 기반 USDC 결제, P2P 송금, Webhook 실시간 추적' },
        { icon: '🔗', title: 'Web3 지갑', desc: 'MetaMask, WalletConnect 연결 + 신용카드 On-Ramp' },
        { icon: '🎰', title: '상점 & 가챠', desc: '이중 재화 + 확률 가챠 + 시즌 랭킹 + 출석 보상' },
      ],
      architecture: 'assets/images/deepsmock_arch.jpeg',
      achievements: [
        'B2B 플랫폼 핵심 연동 시나리오 실전 환경 QA 검증 완료',
        'Circle USDC 전체 결제 파이프라인 구축 (Wallet → 결제 → 보상)',
        'wagmi + ConnectKit + viem Web3 지갑 생태계 통합',
        '21개 API 도메인, 12개 DB 모델 정규화 스키마 설계',
      ]
    }
  };
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  revealElements();
  initNavigation();
  initModal();
  initCursor();
  initTimeline();
});
