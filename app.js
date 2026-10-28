/* ==========================================================================
   POSH Magazine — app.js
   Single shared script: layout chrome, i18n (TR/EN), theme, and page logic.
   Data sources (same paths as the live site):
     data/magazines.json · CV/authors.json · data/legislation.json
     data/links.json · data/interviews.json · data/events.json (optional)
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cache = {};
  const loadJSON = async (path, fallback) => {
    if (cache[path]) return cache[path];
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      return (cache[path] = await r.json());
    } catch (e) {
      if (fallback !== undefined) return fallback;
      throw e;
    }
  };

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
  };

  /* ---------- i18n ---------- */
  const T = {
    tr: {
      tagline: 'İş Sağlığı ve Güvenliği Gelişim Dergisi',
      skip: 'İçeriğe geç',
      nav_issues: 'E-Dergi', nav_editorial: 'Yönetim & Yazarlar', nav_legislation: 'Mevzuat', nav_calendar: 'İSG Takvimi',
      nav_links: 'Faydalı Linkler', nav_interviews: 'Söyleşi', nav_about: 'Hakkımızda', nav_contact: 'İletişim',
      menu: 'Menü', theme: 'Temayı değiştir', close: 'Kapat',
      title_home: 'POSH Magazine — İş Sağlığı ve Güvenliği Gelişim Dergisi',
      title_issues: 'E-Dergi — POSH Magazine', title_editorial: 'Dergi Yönetimi ve Yazarlar — POSH Magazine',
      title_legislation: 'Mevzuat — POSH Magazine', title_calendar: 'İSG Takvimi — POSH Magazine',
      title_links: 'İSG Faydalı Linkler — POSH Magazine', title_interviews: 'Söyleşi — POSH Magazine',
      title_about: 'Hakkımızda — POSH Magazine', title_contact: 'İletişim — POSH Magazine',

      hero_eyebrow: 'Açık erişimli akademik dergi',
      hero_title: 'İş sağlığı ve güvenliğinde <em>ilerleme.</em>',
      hero_lead: 'İSG alanında en güncel araştırmalar, makaleler ve gelişmeler için akademik derginiz. Türkçe ve İngilizce, ücretsiz, herkese açık.',
      read_latest: 'Son sayıyı oku', all_issues: 'Tüm sayılar', new_issue: 'Yeni sayı', issue: 'Sayı', issue_no: 'No.',
      ticker: ['Açık erişim', 'Türkçe & İngilizce', 'Bilimsel', 'Uygulamalı', 'Ücretsiz', 'Güvenlik kültürü', 'İş sağlığı'],
      stat_issues: 'Yayımlanan sayı', stat_since: 'İlk sayı', stat_lang: 'Yayın dili', stat_free: 'Ücretsiz erişim',
      latest_eyebrow: 'Yeni çıkanlar', latest_title: 'Son <em>sayılar</em>', latest_sub: 'En güncel üç sayı. Tamamı arşivde.',
      mission_eyebrow: 'Misyonumuz',
      mission_quote: 'İnsan hayatının <mark>kutsal</mark> olduğuna inanıyoruz.',
      mission_body: 'POSH Magazine, İSG profesyonellerinin ve paydaşlarının ihtiyaç duyduğu bilgi, teori ve uygulamaları Türkçe ve İngilizce içeriklerle erişilebilir kılar. Yayın politikamız ücretsiz ve açık erişimli içerik üretmeyi temel alır.',
      read_more: 'Daha fazla bilgi',
      interviews_eyebrow: 'Konuşmalar', interviews_title: 'Son <em>söyleşiler</em>', all_interviews: 'Tüm söyleşiler',
      explore_eyebrow: 'Keşfet', explore_title: 'İSG için <em>kaynaklar</em>',
      tile_leg: 'Mevzuat', tile_leg_d: 'Yasalar, yönetmelikler, tebliğler ve resmî kaynaklara hızlı erişim.',
      tile_cal: 'İSG Takvimi', tile_cal_d: 'Önemli tarihler, resmî tatiller ve İSG günleri tek takvimde.',
      tile_links: 'Faydalı Linkler', tile_links_d: 'Dünyadaki resmî ve özel İSG kuruluşları, derlenmiş.',
      tile_team: 'Dergi Yönetimi', tile_team_d: 'Editörler, yardımcı editörler ve danışma kurulu.',
      cta_title: 'Dergiye yazı göndermek <em>ister misiniz?</em>',
      cta_body: 'Yazı göndermek, geri bildirim vermek, önerilerinizi ve taleplerinizi iletmek için editör ekibiyle iletişime geçin.',
      write_us: 'Bize yazın',

      issues_title: 'E-<em>Dergi</em>', issues_sub: 'İş sağlığı ve güvenliği alanında yayımlanmış tüm sayılarımıza göz atın.',
      search_ph: 'Ara…', all_years: 'Tümü', no_results: 'Sonuç bulunamadı', results: 'sonuç',
      read: 'Oku', read_pdf: 'PDF olarak oku', open_pdf: 'PDF\'i yeni sekmede aç', download: 'İndir',
      editorial_title: 'Dergi <em>yönetimi</em>', editorial_sub: 'Dergiyi mümkün kılan editör ekibi, yardımcı editörler ve danışma kurulu.',
      role_lead: 'Baş Editör', role_assoc: 'Yardımcı Editörler', role_adv: 'Danışma Kurulu',
      view_profile: 'Özgeçmişi gör', cv: 'Özgeçmiş (CV)', email: 'E-posta', linkedin: 'LinkedIn',
      leg_title: 'Me<em>vzuat</em>', leg_sub: 'İSG ile ilgili resmî sözleşmeler, yasalar, kararnameler, yönetmelikler ve tebliğler.',
      sec_contracts: 'Sözleşmeler', sec_laws: 'Yasalar', sec_decrees: 'Kararnameler', sec_regulations: 'Tüzükler', sec_bylaws: 'Yönetmelikler', sec_communiques: 'Tebliğler',
      sort_alpha: 'Alfabetik', sort_chrono: 'Kronolojik', col_title: 'Başlık', col_mbs: 'MBS', col_kaysis: 'KAYSİS', col_rg: 'Resmî Gazete',
      mbs_link: 'MBS', kaysis_link: 'KAYSİS', no_entries: 'Henüz içerik yok',
      cal_title: 'İSG <em>takvimi</em>', cal_sub: 'Önemli tarihler, etkinlikler ve resmî tatiller.',
      today: 'Bugün', this_month: 'Bu ay', selected_day: 'Seçilen gün', nothing: 'Bu tarihte kayıtlı bir şey yok.', pick_day: 'Ayrıntı için bir güne tıklayın.',
      lg_hol: 'Resmî tatil', lg_osh: 'İSG günü / haftası', lg_event: 'Etkinlik', t_hol: 'Resmî tatil', t_osh: 'İSG', t_event: 'Etkinlik',
      links_title: 'Faydalı <em>linkler</em>', links_sub: 'Dünyadaki İSG resmî ve özel kurumları, kısa bilgilerle.',
      int_title: 'Söy<em>leşi</em>', int_sub: 'Yaptığımız röportajlar ve söyleşiler.', int_label: 'Röportaj', open_int: 'Söyleşiyi oku',
      about_title: 'Hakkımızda', about_sub: 'POSH Magazine, İSG alanında bilimsel araştırmaları, uygulamalı çalışmaları ve sektörel gelişmeleri paylaşan akademik bir dergidir.',
      vision: 'Vizyon', mission: 'Misyon',
      vision_text: 'POSH Magazine, iş sağlığı ve güvenliği (İSG) alanında Türkiye ve dünya genelinde profesyoneller için anlaşılır, güvenilir, bilimsel ve güncel bilgi kaynağı olmak; İSG kültürünün gelişimine katkı sağlayan hem akademik hem de pratik bakış açısını birleştiren lider dijital yayın platformu hâline gelmeyi amaçlar. Bu vizyon, İSG bilincinin yaygınlaşmasına ve daha güvenli iş yaşamı standartlarının küresel düzeyde yükselmesine hizmet etmek üzerine kuruludur.',
      mission_text: 'POSH Magazine’in misyonu, iş sağlığı ve güvenliği profesyonellerinin ve paydaşlarının ihtiyaç duyduğu bilgi, teori ve uygulamaları Türkçe ve İngilizce içeriklerle anlaşılır bir şekilde erişilebilir kılmak; alanla ilgili yenilikleri, mevzuatı, uygulamaları ve bilimsel fikirleri popüler bilim diliyle sunarak bilgi düzeyini artırmak ve güvenlik kültürüne katkı sağlamaktır. İnsan hayatının kutsal olduğuna inanıyoruz. Yayın politikamız ücretsiz ve açık erişimli içerik üretmeyi temel alır.',
      v1: 'Açık erişim', v1d: 'Tüm içerik ücretsiz ve herkese açık.', v2: 'İki dilli', v2d: 'Türkçe ve İngilizce içeriklerle geniş bir okuyucu kitlesi.', v3: 'Bilim + pratik', v3d: 'Akademik bakışı sahadaki uygulamayla buluşturur.',
      contact_title: 'İleti<em>şim</em>', contact_sub: 'Dergiye yazı göndermek, geri bildirim vermek, önerileriniz, istekleriniz ve talepleriniz için aşağıdaki e-posta adreslerini kullanabilirsiniz.',
      c_editor: 'Editör', c_editor_d: 'Yazı gönderimi, geri bildirim, öneri ve talepler.', c_web: 'Web yöneticisi', c_web_d: 'Web sitesi ve teknik konular.',
      send_mail: 'E-posta gönder', copy: 'Kopyala', copied: 'Kopyalandı',
      f_nav: 'Gezinti', f_contact: 'İletişim', f_mag: 'Dergi', rights: 'Tüm hakları saklıdır.',
      f_tag: 'İş sağlığı ve güvenliğinde ilerleme: açık erişimli, iki dilli, bilimsel.',
      months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
      dow: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      pdf_missing: 'PDF görüntülenemiyorsa yeni sekmede açmayı deneyin.',
      current_issue_articles: 'Son Sayı Makaleleri & İçindekiler',
      peer_reviewed_badge: 'Hakemli Açık Erişim',
      read_article: 'Makaleyi Oku',
      article_not_found: 'Makale bulunamadı.',
      nav_admin: 'Yönetim Paneli',
      citation_copied: 'Atıf panoya kopyalandı!',
      views: 'Görüntülenme',
      downloads: 'İndirme',
      share_article: 'Paylaş',
      cite_article: 'Atıf Yap',
      table_of_contents: 'İçindekiler',
      outline: 'Makale Taslağı',
      keywords: 'Anahtar Kelimeler',
      references: 'Kaynakça',
      published_in: 'Yayınlandığı Sayı',
      article_type: 'Makale Türü',
      pages_label: 'Sayfalar',
      received: 'Geliş',
      accepted: 'Kabul',
      published: 'Yayınlanma',
      title_article: 'Makale — POSH Magazine',
      title_admin: 'Makale Yönetim Paneli — POSH Magazine',
      editorial_maint_badge: 'Sistem Bilgisi: Bu Sayfa Şimdilik Bakımda',
      editorial_maint_title: 'Dergi Yönetimi <em>Güncelleniyor</em>',
      editorial_maint_desc: 'POSH Magazine editoryal kurulu, yardımcı editörler ve danışma kurulu listemiz yeni yayın dönemi ve akademik kadro revizyonu çalışmaları kapsamında geçici olarak kullanım dışıdır. Çok yakında güncellenmiş yapısıyla tekrar yayında olacaktır.',
      editorial_maint_status_title: 'Planlı Güncelleme',
      editorial_maint_status_desc: 'Hakemli makale süreçleri ve dergi yayını kesintisiz devam etmekte olup yalnızca editoryal künye sayfası revize edilmektedir.',
      editorial_maint_eta: 'Tahmini Erişim: <strong>Çok Yakında</strong>',
      editorial_maint_contact_title: 'Bize Ulaşın',
      editorial_maint_contact_desc: 'Makale gönderimi, editoryal süreçler veya acil sorularınız için iletişim sayfamızı kullanabilirsiniz.',
      editorial_maint_contact_btn: 'İletişim Sayfası →',
      editorial_maint_browse_title: 'Dergiyi İnceleyin',
      editorial_maint_browse_desc: 'Yayınlanmış tüm dergi sayılarına, hakemli araştırma makalelerine ve arşivimize göz atabilirsiniz.',
      editorial_maint_home_btn: '← Ana Sayfa',
      editorial_maint_issues_btn: 'E-Dergi Sayıları →',
    },
    en: {
      tagline: 'Progress in Occupational Safety and Health',
      skip: 'Skip to content',
      nav_issues: 'E-Journal', nav_editorial: 'Editorial & Authors', nav_legislation: 'Legislation', nav_calendar: 'OSH Calendar',
      nav_links: 'Useful Links', nav_interviews: 'Interviews', nav_about: 'About', nav_contact: 'Contact',
      menu: 'Menu', theme: 'Toggle theme', close: 'Close',
      title_home: 'POSH Magazine — Progress in Occupational Safety and Health',
      title_issues: 'E-Journal — POSH Magazine', title_editorial: 'Editorial Board & Authors — POSH Magazine',
      title_legislation: 'Legislation — POSH Magazine', title_calendar: 'OSH Calendar — POSH Magazine',
      title_links: 'Useful OSH Links — POSH Magazine', title_interviews: 'Interviews — POSH Magazine',
      title_about: 'About Us — POSH Magazine', title_contact: 'Contact — POSH Magazine',

      hero_eyebrow: 'Open-access academic journal',
      hero_title: 'Progress in occupational <em>safety & health.</em>',
      hero_lead: 'Your academic journal for the latest research, articles and developments in OSH. Turkish and English, free and open to everyone.',
      read_latest: 'Read the latest issue', all_issues: 'All issues', new_issue: 'New issue', issue: 'Issue', issue_no: 'No.',
      ticker: ['Open access', 'Turkish & English', 'Scientific', 'Applied', 'Free', 'Safety culture', 'Occupational health'],
      stat_issues: 'Issues published', stat_since: 'First issue', stat_lang: 'Languages', stat_free: 'Free access',
      latest_eyebrow: 'Fresh off the press', latest_title: 'Latest <em>issues</em>', latest_sub: 'The three most recent issues. The rest are in the archive.',
      mission_eyebrow: 'Our mission',
      mission_quote: 'We believe that human life is <mark>sacred.</mark>',
      mission_body: 'POSH Magazine makes the knowledge, theory and practice that OSH professionals and stakeholders need easy to access in Turkish and English. Our publication policy is to produce content that is free and open access.',
      read_more: 'Learn more',
      interviews_eyebrow: 'Conversations', interviews_title: 'Latest <em>interviews</em>', all_interviews: 'All interviews',
      explore_eyebrow: 'Explore', explore_title: 'Resources for <em>OSH</em>',
      tile_leg: 'Legislation', tile_leg_d: 'Laws, regulations, communiqués and quick access to official sources.',
      tile_cal: 'OSH Calendar', tile_cal_d: 'Key dates, public holidays and OSH days in a single calendar.',
      tile_links: 'Useful Links', tile_links_d: 'Official and private OSH organizations worldwide, curated.',
      tile_team: 'Editorial Board', tile_team_d: 'Editors, associate editors and the advisory board.',
      cta_title: 'Want to submit an <em>article?</em>',
      cta_body: 'Get in touch with the editorial team to submit articles, give feedback, or share your suggestions and requests.',
      write_us: 'Write to us',

      issues_title: 'E-<em>Journal</em>', issues_sub: 'Browse every issue we have published in occupational safety and health.',
      search_ph: 'Search…', all_years: 'All', no_results: 'No results found', results: 'results',
      read: 'Read', read_pdf: 'Read as PDF', open_pdf: 'Open PDF in new tab', download: 'Download',
      editorial_title: 'Editorial <em>board</em>', editorial_sub: 'The editors, associate editors and advisory board behind the journal.',
      role_lead: 'Editor-in-Chief', role_assoc: 'Associate Editors', role_adv: 'Advisory Board',
      view_profile: 'View profile', cv: 'Résumé (CV)', email: 'Email', linkedin: 'LinkedIn',
      leg_title: 'Legis<em>lation</em>', leg_sub: 'Official OSH contracts, laws, decrees, regulations and communiqués.',
      sec_contracts: 'Contracts', sec_laws: 'Laws', sec_decrees: 'Decrees', sec_regulations: 'Regulations', sec_bylaws: 'Bylaws', sec_communiques: 'Communiqués',
      sort_alpha: 'Alphabetical', sort_chrono: 'Chronological', col_title: 'Title', col_mbs: 'MBS', col_kaysis: 'KAYSIS', col_rg: 'Official Gazette',
      mbs_link: 'MBS', kaysis_link: 'KAYSIS', no_entries: 'No entries yet',
      cal_title: 'OSH <em>calendar</em>', cal_sub: 'Key dates, events and public holidays.',
      today: 'Today', this_month: 'This month', selected_day: 'Selected day', nothing: 'Nothing recorded on this date.', pick_day: 'Click a day for details.',
      lg_hol: 'Public holiday', lg_osh: 'OSH day / week', lg_event: 'Event', t_hol: 'Holiday', t_osh: 'OSH', t_event: 'Event',
      links_title: 'Useful <em>links</em>', links_sub: 'Official and private OSH organizations worldwide, with short notes.',
      int_title: 'Inter<em>views</em>', int_sub: 'Our interviews and conversations.', int_label: 'Interview', open_int: 'Read the interview',
      about_title: 'About us', about_sub: 'POSH Magazine is an academic journal sharing scientific research, applied studies and sectoral developments in occupational safety and health.',
      vision: 'Vision', mission: 'Mission',
      vision_text: 'POSH Magazine wants to be a clear, reliable, scientific and up-to-date source of information for professionals in the field of occupational health and safety (OHS) in Turkey and worldwide. It wants to become a leading digital publishing platform that brings together both academic and practical information to help develop an OHS culture. This vision is based on spreading OHS awareness and improving workplace safety worldwide.',
      mission_text: 'POSH Magazine\'s mission is to make the information, theory, and practices required by occupational health and safety professionals and stakeholders easy to access in Turkish and English; and to help create a culture of safety by sharing innovations, legislation, practices, and scientific ideas related to the field in easy-to-understand language. We believe that human life is sacred. Our publication policy is to produce content that is free and easy to access.',
      v1: 'Open access', v1d: 'All content is free and open to everyone.', v2: 'Bilingual', v2d: 'Turkish and English content for a wide readership.', v3: 'Science + practice', v3d: 'Bringing the academic view together with field practice.',
      contact_title: 'Con<em>tact</em>', contact_sub: 'To submit articles, give feedback, or share your suggestions, requests and inquiries, use the email addresses below.',
      c_editor: 'Editor', c_editor_d: 'Article submissions, feedback, suggestions and requests.', c_web: 'Webmaster', c_web_d: 'Website and technical matters.',
      send_mail: 'Send email', copy: 'Copy', copied: 'Copied',
      f_nav: 'Navigate', f_contact: 'Contact', f_mag: 'Journal', rights: 'All rights reserved.',
      f_tag: 'Progress in occupational safety and health: open access, bilingual, scientific.',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      dow: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      pdf_missing: 'If the PDF does not display, try opening it in a new tab.',
      current_issue_articles: 'Current Issue Articles & Contents',
      peer_reviewed_badge: 'Peer-Reviewed Open Access',
      read_article: 'Read Article',
      article_not_found: 'Article not found.',
      nav_admin: 'Admin Panel',
      citation_copied: 'Citation copied to clipboard!',
      views: 'Views',
      downloads: 'Downloads',
      share_article: 'Share',
      cite_article: 'Cite',
      table_of_contents: 'Table of Contents',
      outline: 'Article Outline',
      keywords: 'Keywords',
      references: 'References',
      published_in: 'Published in',
      article_type: 'Article Type',
      pages_label: 'Pages',
      received: 'Received',
      accepted: 'Accepted',
      published: 'Published',
      title_article: 'Article — POSH Magazine',
      title_admin: 'Admin Panel — POSH Magazine',
      editorial_maint_badge: 'System Notice: Page Under Maintenance',
      editorial_maint_title: 'Editorial Board <em>Under Maintenance</em>',
      editorial_maint_desc: 'Our Editorial Board, Associate Editors, and Advisory Board directory is temporarily offline for scheduled academic faculty updates. It will be back online shortly with renewed details.',
      editorial_maint_status_title: 'Scheduled Update',
      editorial_maint_status_desc: 'Peer-reviewed article workflows and journal publication continue uninterrupted; only the editorial masthead is being revised.',
      editorial_maint_eta: 'Estimated Availability: <strong>Coming Soon</strong>',
      editorial_maint_contact_title: 'Get in Touch',
      editorial_maint_contact_desc: 'For manuscript submissions, editorial inquiries, or urgent questions, please visit our contact page.',
      editorial_maint_contact_btn: 'Contact Page →',
      editorial_maint_browse_title: 'Explore Journal',
      editorial_maint_browse_desc: 'Explore all published issues, peer-reviewed articles, and our complete journal archive.',
      editorial_maint_home_btn: '← Home',
      editorial_maint_issues_btn: 'E-Journal Issues →',
    },
    es: {
      tagline: 'Progreso en Seguridad y Salud en el Trabajo',
      skip: 'Saltar al contenido principal',
      nav_issues: 'Revista Digital', nav_editorial: 'Comité y Autores', nav_legislation: 'Legislación', nav_calendar: 'Calendario SST',
      nav_links: 'Enlaces Útiles', nav_interviews: 'Entrevistas', nav_about: 'Sobre Nosotros', nav_contact: 'Contacto',
      menu: 'Menú', theme: 'Cambiar tema', close: 'Cerrar',
      title_home: 'POSH Magazine — Progreso en Seguridad y Salud en el Trabajo',
      title_issues: 'Revista Digital — POSH Magazine', title_editorial: 'Comité Editorial y Autores — POSH Magazine',
      title_legislation: 'Legislación — POSH Magazine', title_calendar: 'Calendario SST — POSH Magazine',
      title_links: 'Enlaces Útiles SST — POSH Magazine', title_interviews: 'Entrevistas — POSH Magazine',
      title_about: 'Sobre Nosotros — POSH Magazine', title_contact: 'Contacto — POSH Magazine',

      hero_eyebrow: 'Revista académica de acceso abierto',
      hero_title: 'Progreso en <em>seguridad y salud</em> laboral.',
      hero_lead: 'Su revista académica para las investigaciones, artículos y avances más recientes en SST. En turco, inglés y español, gratuita y de libre acceso para todos.',
      read_latest: 'Leer el último número', all_issues: 'Todos los números', new_issue: 'Nuevo número', issue: 'Número', issue_no: 'N.º',
      ticker: ['Acceso abierto', 'TR · EN · ES', 'Científico', 'Aplicado', 'Gratuito', 'Cultura de seguridad', 'Salud ocupacional'],
      stat_issues: 'Números publicados', stat_since: 'Primer número', stat_lang: 'Idiomas', stat_free: 'Acceso gratuito',
      latest_eyebrow: 'Recién publicados', latest_title: 'Últimos <em>números</em>', latest_sub: 'Los tres números más recientes. El resto se encuentra en el archivo histórico.',
      mission_eyebrow: 'Nuestra misión',
      mission_quote: 'Creemos que la vida humana es <mark>sagrada.</mark>',
      mission_body: 'POSH Magazine hace que el conocimiento, la teoría y la práctica que necesitan los profesionales y partes interesadas en SST sean fácilmente accesibles en turco, inglés y español. Nuestra política editorial se basa en producir contenidos gratuitos y de acceso abierto.',
      read_more: 'Más información',
      interviews_eyebrow: 'Conversaciones', interviews_title: 'Últimas <em>entrevistas</em>', all_interviews: 'Todas las entrevistas',
      explore_eyebrow: 'Explorar', explore_title: 'Recursos para <em>SST</em>',
      tile_leg: 'Legislación', tile_leg_d: 'Leyes, reglamentos, decretos y acceso rápido a fuentes oficiales.',
      tile_cal: 'Calendario SST', tile_cal_d: 'Fechas clave, festivos oficiales y jornadas de SST en un solo calendario.',
      tile_links: 'Enlaces Útiles', tile_links_d: 'Organizaciones oficiales y privadas de SST en todo el mundo, seleccionadas.',
      tile_team: 'Comité Editorial', tile_team_d: 'Editores, editores asociados y el consejo asesor.',
      cta_title: '¿Desea enviar un <em>artículo?</em>',
      cta_body: 'Póngase en contacto con el equipo editorial para enviar artículos, remitir comentarios o compartir sus sugerencias y solicitudes.',
      write_us: 'Escríbanos',

      issues_title: 'Revista <em>Digital</em>', issues_sub: 'Consulte todos los números que hemos publicado en seguridad y salud laboral.',
      search_ph: 'Buscar…', all_years: 'Todos', no_results: 'No se encontraron resultados', results: 'resultados',
      read: 'Leer', read_pdf: 'Leer como PDF', open_pdf: 'Abrir PDF en nueva pestaña', download: 'Descargar',
      editorial_title: 'Comité <em>editorial</em>', editorial_sub: 'El equipo de editores, editores asociados y el consejo asesor que hacen posible la revista.',
      role_lead: 'Editor en Jefe', role_assoc: 'Editores Asociados', role_adv: 'Consejo Asesor',
      view_profile: 'Ver perfil', cv: 'Currículum (CV)', email: 'Correo electrónico', linkedin: 'LinkedIn',
      leg_title: 'Legis<em>lación</em>', leg_sub: 'Convenios oficiales, leyes, decretos, reglamentos y comunicados de SST.',
      sec_contracts: 'Convenios', sec_laws: 'Leyes', sec_decrees: 'Decretos', sec_regulations: 'Estatutos', sec_bylaws: 'Reglamentos', sec_communiques: 'Comunicados',
      sort_alpha: 'Alfabético', sort_chrono: 'Cronológico', col_title: 'Título', col_mbs: 'MBS', col_kaysis: 'KAYSIS', col_rg: 'Boletín Oficial',
      mbs_link: 'MBS', kaysis_link: 'KAYSIS', no_entries: 'Sin contenido aún',
      cal_title: 'Calendario de <em>SST</em>', cal_sub: 'Fechas clave, eventos y festivos oficiales.',
      today: 'Hoy', this_month: 'Este mes', selected_day: 'Día seleccionado', nothing: 'No hay registros en esta fecha.', pick_day: 'Haga clic en un día para ver detalles.',
      lg_hol: 'Festivo oficial', lg_osh: 'Día / semana de SST', lg_event: 'Evento', t_hol: 'Festivo', t_osh: 'SST', t_event: 'Evento',
      links_title: 'Enlaces <em>útiles</em>', links_sub: 'Instituciones oficiales y privadas de SST en el mundo, con notas informativas.',
      int_title: 'Entre<em>vistas</em>', int_sub: 'Nuestras entrevistas y diálogos con especialistas.', int_label: 'Entrevista', open_int: 'Leer la entrevista',
      about_title: 'Sobre nosotros', about_sub: 'POSH Magazine es una revista académica que difunde investigaciones científicas, estudios aplicados y novedades sectoriales en seguridad y salud laboral.',
      vision: 'Visión', mission: 'Misión',
      vision_text: 'POSH Magazine aspira a ser una fuente de información clara, fiable, científica y actualizada para profesionales en el campo de la seguridad y salud en el trabajo (SST) en Turquía y a nivel internacional; convirtiéndose en una plataforma editorial digital líder que aúna tanto la perspectiva académica como la práctica para contribuir al desarrollo de la cultura preventiva. Esta visión se fundamenta en extender la concienciación sobre SST y elevar los estándares laborales a nivel global.',
      mission_text: 'La misión de POSH Magazine es facilitar el acceso al conocimiento, la teoría y la práctica requeridos por los profesionales y entidades de SST en turco, inglés y español; fomentando la cultura de seguridad mediante la divulgación rigurosa y accesible de innovaciones, legislación, aplicaciones e ideas científicas. Creemos que la vida humana es sagrada. Nuestra política de publicación se basa en generar contenidos de acceso libre y gratuito.',
      v1: 'Acceso abierto', v1d: 'Todo el contenido es gratuito y abierto a todos.', v2: 'Trilingüe', v2d: 'Contenidos en turco, inglés y español para una amplia audiencia internacional.', v3: 'Ciencia + práctica', v3d: 'Conectando la perspectiva académica con la experiencia de campo.',
      contact_title: 'Con<em>tacto</em>', contact_sub: 'Para enviar artículos, remitir sugerencias, consultas o solicitudes, utilice las direcciones de correo electrónico indicadas a continuación.',
      c_editor: 'Editor', c_editor_d: 'Envío de manuscritos, comentarios, sugerencias y consultas.', c_web: 'Webmaster', c_web_d: 'Página web y cuestiones técnicas.',
      send_mail: 'Enviar correo', copy: 'Copiar', copied: 'Copiado',
      f_nav: 'Navegación', f_contact: 'Contacto', f_mag: 'Revista', rights: 'Todos los derechos reservados.',
      f_tag: 'Progreso en seguridad y salud laboral: acceso abierto, trilingüe, científico.',
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      dow: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      pdf_missing: 'Si el PDF no se muestra correctamente, intente abrirlo en una nueva pestaña.',
      current_issue_articles: 'Artículos del Último Número & Índice',
      peer_reviewed_badge: 'Revisión por Pares · Acceso Abierto',
      read_article: 'Leer Artículo',
      article_not_found: 'Artículo no encontrado.',
      nav_admin: 'Panel de Gestión',
      citation_copied: '¡Cita copiada al portapapeles!',
      views: 'Visualizaciones',
      downloads: 'Descargas',
      share_article: 'Compartir',
      cite_article: 'Citar',
      table_of_contents: 'Índice de Contenidos',
      outline: 'Estructura del Artículo',
      keywords: 'Palabras Clave',
      references: 'Referencias Bibliográficas',
      published_in: 'Publicado en',
      article_type: 'Tipo de Artículo',
      pages_label: 'Páginas',
      received: 'Recibido',
      accepted: 'Aceptado',
      published: 'Publicado',
      title_article: 'Artículo — POSH Magazine',
      title_admin: 'Panel de Gestión de Artículos — POSH Magazine',
      editorial_maint_badge: 'Aviso del Sistema: Página en Mantenimiento',
      editorial_maint_title: 'Consejo Editorial <em>en Mantenimiento</em>',
      editorial_maint_desc: 'El directorio de nuestro Comité Editorial, Editores Asociados y Consejo Asesor está temporalmente fuera de servicio debido a revisiones académicas. Volverá a estar disponible muy pronto con información renovada.',
      editorial_maint_status_title: 'Actualización Programada',
      editorial_maint_status_desc: 'Los procesos de publicación y revisión por pares continúan con normalidad; solo se está actualizando la página editorial.',
      editorial_maint_eta: 'Disponibilidad Estimada: <strong>Muy Pronto</strong>',
      editorial_maint_contact_title: 'Contáctenos',
      editorial_maint_contact_desc: 'Para envíos de manuscritos, consultas editoriales o dudas urgentes, visite nuestra página de contacto.',
      editorial_maint_contact_btn: 'Página de Contacto →',
      editorial_maint_browse_title: 'Explorar la Revista',
      editorial_maint_browse_desc: 'Explore todos los números publicados, artículos revisados por pares y nuestro archivo completo.',
      editorial_maint_home_btn: '← Inicio',
      editorial_maint_issues_btn: 'Números de Revista →',
    },
  };

  let lang = store.get('posh_lang', null) || (document.documentElement.lang === 'es' ? 'es' : document.documentElement.lang === 'en' ? 'en' : 'tr');
  if (lang !== 'tr' && lang !== 'en' && lang !== 'es') lang = 'tr';
  const t = k => (T[lang]?.[k] ?? T.en?.[k] ?? T.tr[k] ?? k);
  const page = document.body.dataset.page || 'home';
  const locale = () => (lang === 'es' ? 'es-ES' : lang === 'tr' ? 'tr-TR' : 'en-GB');
  const fmtDate = (iso, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => new Date(iso + 'T00:00:00').toLocaleDateString(locale(), opts);
  const pick = (o, base) => {
    if (lang === 'es') return o[base + 'ES'] ?? o[base + 'Es'] ?? o[base + 'EN'] ?? o[base + 'En'] ?? o[base + 'TR'] ?? o[base + 'Tr'];
    if (lang === 'en') return o[base + 'EN'] ?? o[base + 'En'] ?? o[base + 'TR'] ?? o[base + 'Tr'];
    return o[base + 'TR'] ?? o[base + 'Tr'] ?? o[base + 'EN'] ?? o[base + 'En'];
  };

  function applyI18n(root = document) {
    $$('[data-i18n]', root).forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    $$('[data-i18n-ph]', root).forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-label]', root).forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
    document.documentElement.lang = lang;
    document.title = t('title_' + page);
  }

  /* ---------- theme ---------- */
  const savedTheme = store.get('posh_theme', null);
  document.documentElement.dataset.theme = savedTheme || 'light';
  function setTheme(v) {
    document.documentElement.dataset.theme = v;
    store.set('posh_theme', v);
    const b = $('#themeBtn');
    if (b) b.innerHTML = v === 'dark' ? ICON.sun : ICON.moon;
  }

  /* ---------- chrome (header / footer) ---------- */
  const NAV = [
    ['issues', 'issues.html', 'nav_issues'], ['editorial', 'editorial.html', 'nav_editorial'],
    ['legislation', 'legislation.html', 'nav_legislation'], ['calendar', 'calendar.html', 'nav_calendar'],
    ['links', 'links.html', 'nav_links'], ['interviews', 'interviews.html', 'nav_interviews'],
    ['about', 'about.html', 'nav_about'], ['contact', 'contact.html', 'nav_contact'],
  ];

  function renderChrome() {
    const navLinks = NAV.map(([k, href, key]) => `<a href="${href}" data-i18n="${key}"${page === k ? ' aria-current="page"' : ''}>${t(key)}</a>`).join('');
    const drawerLinks = NAV.map(([k, href, key], i) => `<a href="${href}"${page === k ? ' aria-current="page"' : ''}><span data-i18n="${key}">${t(key)}</span><small>${String(i + 1).padStart(2, '0')}</small></a>`).join('');
    $('#site-header').innerHTML = `
      <a class="skip" href="#main" data-i18n="skip">${t('skip')}</a>
      <div class="topbar"><div class="wrap">
        <div class="topbar-left mono"><span class="pulse"></span><span data-i18n="tagline">${t('tagline')}</span></div>
        <div class="topbar-right">
          <span class="mono topbar-date" id="todayLbl"></span>
          <div class="seg" role="group" aria-label="Language">
            <button type="button" data-lang="tr" aria-pressed="${lang === 'tr'}">TR</button>
            <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button>
            <button type="button" data-lang="es" aria-pressed="${lang === 'es'}">ES</button>
          </div>
          <button type="button" class="icon-btn" id="themeBtn" data-i18n-label="theme" aria-label="${t('theme')}"></button>
        </div>
      </div></div>
      <header class="header"><div class="wrap header-row">
        <a class="brand" href="index.html" aria-label="POSH Magazine"><span class="brand-word">POSH</span><span class="brand-sub">Magazine</span></a>
        <nav class="nav" aria-label="Main">${navLinks}</nav>
        <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="drawer" data-i18n-label="menu" aria-label="${t('menu')}"><span></span><span></span><span></span></button>
      </div></header>
      <nav class="drawer" id="drawer" aria-label="Mobile">${drawerLinks}</nav>`;

    const y = new Date().getFullYear();
    $('#site-footer').innerHTML = `
      <div class="wrap">
        <div class="footer-grid">
          <div><a class="f-brand" href="index.html">POSH Magazine</a><p class="tag-line" data-i18n="f_tag">${t('f_tag')}</p></div>
          <div><h4 data-i18n="f_nav">${t('f_nav')}</h4><ul>${NAV.slice(0, 4).map(([, h, k]) => `<li><a href="${h}" data-i18n="${k}">${t(k)}</a></li>`).join('')}</ul></div>
          <div><h4 data-i18n="f_mag">${t('f_mag')}</h4><ul>${NAV.slice(4).map(([, h, k]) => `<li><a href="${h}" data-i18n="${k}">${t(k)}</a></li>`).join('')}</ul></div>
          <div><h4 data-i18n="f_contact">${t('f_contact')}</h4><ul><li><a href="mailto:editor@poshmagazine.org">editor@poshmagazine.org</a></li><li><a href="mailto:webmaster@poshmagazine.org">webmaster@poshmagazine.org</a></li>${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') ? `<li><a href="admin/index.html" style="color:var(--yellow);font-weight:600;"><span data-i18n="nav_admin">${t('nav_admin')}</span> ⚙ (Yerel)</a></li>` : ''}</ul></div>
        </div>
        <div class="footer-word" aria-hidden="true">POSH</div>
      </div>
      <div class="footer-bottom"><div class="wrap" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem;padding:0">
        <span class="mono">© ${y} POSH Magazine. <span data-i18n="rights">${t('rights')}</span></span>
        <span class="mono">Progress in Occupational Safety and Health</span>
      </div></div>`;

    updateToday();
    setTheme(document.documentElement.dataset.theme);

    $$('.seg button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
    $('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    const burger = $('#burger'), drawer = $('#drawer');
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open);
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', drawer).forEach(a => a.addEventListener('click', () => { document.body.style.overflow = ''; }));
  }

  function updateToday() {
    const el = $('#todayLbl');
    if (el) el.textContent = new Date().toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function setLang(l) {
    if (l === lang) return;
    lang = l; store.set('posh_lang', l);
    $$('.seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
    applyI18n(); updateToday();
    renderPage();
  }

  /* ---------- reveal on scroll ---------- */
  let io;
  function reveal(root = document) {
    const els = $$('.reveal:not(.in)', root);
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- dialog ---------- */
  let dlg;
  function openDialog({ title, bodyHTML, actionsHTML = '', raw = false }) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', () => { dlg.innerHTML = ''; });
      document.body.appendChild(dlg);
    }
    dlg.innerHTML = `
      <div class="dlg-bar">
        <h2>${esc(title)}</h2>
        <div class="acts">${actionsHTML}<button type="button" class="dlg-x" aria-label="${t('close')}">${ICON.x}</button></div>
      </div>${raw ? bodyHTML : `<div class="dlg-body">${bodyHTML}</div>`}`;
    $('.dlg-x', dlg).addEventListener('click', () => dlg.close());
    dlg.showModal();
  }

  /* ==========================================================================
     Components
     ========================================================================== */
  const sortIssues = list => [...list].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate) || b.year - a.year || b.issue - a.issue);
  const pdfHref = m => encodeURI(m.pdfUrl);

  function issueCard(m, i = 0, hasArticles = false) {
    const isDigital = hasArticles || !m.pdfUrl;
    const ctaText = isDigital
      ? (lang === 'es' ? 'Ver Artículos →' : lang === 'en' ? 'View Articles →' : 'Makaleleri Oku →')
      : `${t('read_pdf')} →`;
    const badgeText = isDigital
      ? (lang === 'es' ? 'DİJİTAL SAYI' : lang === 'en' ? 'DIGITAL ISSUE' : 'DİJİTAL SAYI')
      : 'PDF';

    return `
      <article class="issue reveal" style="--d:${(i % 4) * .08}s">
        <button type="button" class="issue-cover" data-issue="${m.id}" data-cta="${ctaText}" aria-label="${ctaText}: ${t('issue')} ${m.issue}">
          <img src="${esc(m.coverImage)}" alt="POSH Magazine ${t('issue')} ${m.issue} — ${esc(pick(m, 'description'))}" loading="lazy" width="900" height="1273">
          ${isDigital ? `<span class="issue-badge-tag" style="position:absolute;top:10px;left:10px;background:var(--yellow);color:#12110e;font-size:.7rem;font-weight:700;font-family:var(--font-mono);padding:.22rem .55rem;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,0.25);z-index:2;letter-spacing:.04em;">${badgeText}</span>` : ''}
        </button>
        <div class="issue-meta">
          <div class="issue-no"><small>${t('issue_no')}</small>${m.issue}</div>
          <div class="issue-title">${esc(pick(m, 'description'))}</div>
          <div class="issue-date">${fmtDate(m.publishDate)}</div>
        </div>
      </article>`;
  }

  function bindIssueCards(root, list, articles = null) {
    $$('[data-issue]', root).forEach(b => b.addEventListener('click', async () => {
      const m = list.find(x => String(x.id) === b.dataset.issue);
      if (!m) return;

      const allArts = articles || await getAllArticles();
      const issueArticles = allArts.filter(a => a.issueNo === m.issue || a.issueId === m.id);

      if (issueArticles.length > 0) {
        // Digital Issue Table of Contents & Article Reader Modal
        const artsHtml = issueArticles.map(renderTocArticleItem).join('');
        const hasPdf = Boolean(m.pdfUrl && m.pdfUrl.trim());
        const acts = hasPdf ? `
          <a class="btn sm yellow" href="${pdfHref(m)}" target="_blank" rel="noopener">${t('open_pdf')} ${ICON.ext}</a>
          <a class="btn sm ghost" href="${pdfHref(m)}" download>${t('download')} ${ICON.download}</a>
        ` : '';

        openDialog({
          title: `POSH Magazine · ${t('issue')} ${m.issue} (${m.year}) · ${pick(m, 'description')}`,
          actionsHTML: acts,
          bodyHTML: `
            <div class="digital-issue-modal">
              <div class="digital-issue-header" style="display:flex;gap:1.5rem;align-items:center;padding-bottom:1.5rem;margin-bottom:1.5rem;border-bottom:1px solid var(--line);flex-wrap:wrap;">
                <img src="${esc(m.coverImage)}" alt="Sayı ${m.issue}" style="width:115px;height:auto;aspect-ratio:1/1.41;object-fit:cover;box-shadow:var(--shadow-sm);border:1px solid var(--line);border-radius:3px;">
                <div style="flex:1;min-width:220px;">
                  <span class="tag y" style="font-size:.75rem;font-weight:700;">🌐 ${lang === 'es' ? 'NÚMERO DIGITAL DE ACCESO ABIERTO' : lang === 'en' ? 'OPEN ACCESS DIGITAL ISSUE' : 'AÇIK ERİŞİMLİ DİJİTAL SAYI'}</span>
                  <h3 style="font-family:var(--font-serif);font-size:1.6rem;margin:.5rem 0 .2rem;letter-spacing:-.02em;">${t('issue')} ${m.issue} · ${esc(pick(m, 'description'))}</h3>
                  <div class="mono" style="font-size:.82rem;color:var(--muted);">${fmtDate(m.publishDate)} · Cilt ${m.year - 2022} · ${issueArticles.length} ${lang === 'es' ? 'Artículos' : lang === 'en' ? 'Articles' : 'Makale'}</div>
                  ${hasPdf ? `<div class="mono" style="font-size:.78rem;color:var(--muted);margin-top:.4rem;">💡 Bu sayının tam arşiv PDF'i de mevcuttur.</div>` : ''}
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem;">
                  <h4 class="mono" style="font-size:.82rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin:0;">
                    ${lang === 'es' ? 'Artículos Publicados en Este Número' : lang === 'en' ? 'Peer-Reviewed Articles in This Issue' : 'Bu Sayıda Yayınlanan Hakemli Makaleler'}
                  </h4>
                  <span class="mono" style="font-size:.78rem;color:var(--orange);font-weight:600;">${issueArticles.length} ${lang === 'es' ? 'Trabajos' : lang === 'en' ? 'Papers' : 'Yayın'}</span>
                </div>
                <div class="issue-modal-articles" style="display:flex;flex-direction:column;gap:.9rem;">
                  ${artsHtml}
                </div>
              </div>
            </div>
          `
        });
      } else {
        // Fallback for legacy issues without web articles
        const hasPdf = Boolean(m.pdfUrl && m.pdfUrl.trim());
        if (hasPdf) {
          openDialog({
            title: `POSH Magazine · ${t('issue')} ${m.issue} · ${pick(m, 'description')}`,
            raw: true,
            actionsHTML: `<a class="btn sm yellow" href="${pdfHref(m)}" target="_blank" rel="noopener">${t('open_pdf')} ${ICON.ext}</a><a class="btn sm ghost" href="${pdfHref(m)}" download>${t('download')} ${ICON.download}</a>`,
            bodyHTML: `<iframe class="pdf-frame" src="${pdfHref(m)}#view=FitH" title="POSH Magazine ${t('issue')} ${m.issue}"></iframe>`,
          });
        } else {
          openDialog({
            title: `POSH Magazine · ${t('issue')} ${m.issue} · ${pick(m, 'description')}`,
            bodyHTML: `<div class="empty" style="padding:3rem;">${lang === 'es' ? 'Este número digital se está preparando. Pronto se agregarán artículos.' : lang === 'en' ? 'This digital issue is currently being compiled. Articles will be available soon.' : 'Bu dijital sayı hazırlanmaktadır. Makaleler yakında eklenecektir.'}</div>`
          });
        }
      }
    }));
  }

  const sectionHead = (eyebrow, title, sub = '', extra = '') => `
    <div class="section-head reveal">
      <div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${extra}
    </div>`;

  /* ==========================================================================
     Issue Data Helper (LocalStorage + static JSON fallback)
     ========================================================================== */
  async function getAllIssues() {
    let local = [];
    try {
      const stored = localStorage.getItem('posh_issues');
      if (stored) local = JSON.parse(stored);
    } catch {}

    const base = await loadJSON('data/magazines.json', { issues: [] });
    const baseIssues = base.issues || [];

    const map = new Map();
    baseIssues.forEach(iss => map.set(Number(iss.issue), iss));
    local.forEach(iss => map.set(Number(iss.issue), iss));

    return sortIssues(Array.from(map.values()));
  }

  /* ==========================================================================
     Academic Translation Protocol (Reader-side Dynamic Translation Engine)
     ========================================================================== */
  const langName = code => (code === 'es' ? 'Español' : code === 'en' ? 'English' : 'Türkçe');

  function hashStr(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return String(Math.abs(hash));
  }

  const ACADEMIC_TERMS = {
    'tr->en': {
      'Giriş': 'Introduction', 'Yöntem': 'Methodology', 'Yöntem ve Materyal': 'Materials and Methods',
      'Bulgular': 'Results and Findings', 'Tartışma': 'Discussion', 'Sonuç': 'Conclusion',
      'Özet': 'Abstract', 'Kaynakça': 'References', 'Araştırma Makalesi': 'Research Article',
      'Teknik İnceleme': 'Technical Review', 'Uygulamalı Vaka Analizi': 'Applied Case Study',
      'Editoryal': 'Editorial', 'Kısa Bildiri': 'Short Communication'
    },
    'tr->es': {
      'Giriş': 'Introducción', 'Yöntem': 'Metodología', 'Yöntem ve Materyal': 'Materiales y Métodos',
      'Bulgular': 'Resultados y Hallazgos', 'Tartışma': 'Discusión', 'Sonuç': 'Conclusión',
      'Özet': 'Resumen', 'Kaynakça': 'Referencias', 'Araştırma Makalesi': 'Artículo de Investigación',
      'Teknik İnceleme': 'Revisión Técnica', 'Uygulamalı Vaka Analizi': 'Estudio de Caso Aplicado',
      'Editoryal': 'Editorial', 'Kısa Bildiri': 'Comunicación Corta'
    },
    'en->tr': {
      'Introduction': 'Giriş', 'Methodology': 'Yöntem', 'Materials and Methods': 'Materyal ve Yöntem',
      'Results': 'Bulgular', 'Discussion': 'Tartışma', 'Conclusion': 'Sonuç',
      'Abstract': 'Özet', 'References': 'Kaynakça', 'Research Article': 'Araştırma Makalesi',
      'Technical Review': 'Teknik İnceleme', 'Applied Case Study': 'Uygulamalı Vaka Analizi'
    },
    'en->es': {
      'Introduction': 'Introducción', 'Methodology': 'Metodología', 'Materials and Methods': 'Materiales y Métodos',
      'Results': 'Resultados', 'Discussion': 'Discusión', 'Conclusion': 'Conclusión',
      'Abstract': 'Resumen', 'References': 'Referencias', 'Research Article': 'Artículo de Investigación'
    }
  };

  async function translateText(text, fromLang, toLang) {
    if (!text || fromLang === toLang) return text;
    const clean = text.trim();
    if (!clean) return text;

    const dict = ACADEMIC_TERMS[`${fromLang}->${toLang}`];
    if (dict && dict[clean]) return dict[clean];

    const cacheKey = `posh_tr_${fromLang}_${toLang}_${hashStr(clean)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${fromLang}|${toLang}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.responseData?.translatedText) {
          const trans = data.responseData.translatedText.trim();
          try { localStorage.setItem(cacheKey, trans); } catch {}
          return trans;
        }
      }
    } catch (err) {
      console.warn('[TranslationProtocol] translation request failed:', err);
    }
    return text;
  }

  async function translateHtmlContent(html, fromLang, toLang) {
    if (!html || fromLang === toLang) return html;
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    const blocks = Array.from(tmp.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th'));
    if (!blocks.length) return html;

    const promises = blocks.map(async (el) => {
      const orig = el.textContent.trim();
      if (orig && orig.length > 2) {
        const trans = await translateText(orig, fromLang, toLang);
        if (trans && trans !== orig) {
          el.textContent = trans;
        }
      }
    });

    await Promise.all(promises);
    return tmp.innerHTML;
  }

  /* ==========================================================================
     Article Data Helper (LocalStorage + static JSON fallback + Deletion support)
     ========================================================================== */
  async function getAllArticles() {
    let deleted = [];
    try {
      const storedDel = localStorage.getItem('posh_deleted_articles');
      if (storedDel) deleted = JSON.parse(storedDel);
    } catch {}
    let local = [];
    try {
      const stored = localStorage.getItem('posh_articles');
      if (stored) local = JSON.parse(stored);
    } catch {}
    const base = await loadJSON('data/articles.json', []);
    const map = new Map();
    base.forEach(a => {
      if (!deleted.includes(a.id)) map.set(a.id, a);
    });
    local.forEach(a => {
      if (!deleted.includes(a.id)) map.set(a.id, a);
    });
    return Array.from(map.values());
  }

  function saveArticleToLocal(article) {
    let deleted = [];
    try {
      const storedDel = localStorage.getItem('posh_deleted_articles');
      if (storedDel) deleted = JSON.parse(storedDel);
    } catch {}
    deleted = deleted.filter(id => id !== article.id);
    localStorage.setItem('posh_deleted_articles', JSON.stringify(deleted));

    let local = [];
    try {
      const stored = localStorage.getItem('posh_articles');
      if (stored) local = JSON.parse(stored);
    } catch {}
    const idx = local.findIndex(a => a.id === article.id);
    if (idx >= 0) local[idx] = article;
    else local.push(article);
    localStorage.setItem('posh_articles', JSON.stringify(local));
  }

  function deleteArticleFromLocal(id) {
    let deleted = [];
    try {
      const storedDel = localStorage.getItem('posh_deleted_articles');
      if (storedDel) deleted = JSON.parse(storedDel);
    } catch {}
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem('posh_deleted_articles', JSON.stringify(deleted));
    }

    let local = [];
    try {
      const stored = localStorage.getItem('posh_articles');
      if (stored) local = JSON.parse(stored);
    } catch {}
    local = local.filter(a => a.id !== id);
    localStorage.setItem('posh_articles', JSON.stringify(local));
  }

  function renderTocArticleItem(art) {
    const origTitle = pick(art, 'title');
    const sourceLang = art.originalLang || (art.titleTR ? 'tr' : art.titleEN ? 'en' : 'tr');
    const authors = (art.authors || []).map(a => `<span>${esc(a.name)}</span>`).join('');
    const type = lang === 'es' ? (art.articleTypeES || art.articleType || 'Artículo de Investigación') : lang === 'en' ? (art.articleType || 'Research Article') : (art.articleTypeTR || art.articleType || 'Araştırma Makalesi');
    const itemElId = `toc-art-${art.id}`;

    // Auto translate TOC title if reader language differs from article source language
    if (lang !== sourceLang && (!art['title' + lang.toUpperCase()])) {
      setTimeout(async () => {
        const transTitle = await translateText(origTitle, sourceLang, lang);
        const titleEl = document.getElementById(itemElId);
        if (titleEl && transTitle) {
          titleEl.textContent = transTitle;
        }
      }, 0);
    }

    return `
      <article class="toc-item">
        <div>
          <div class="toc-meta">
            <span class="toc-type">${esc(type)}</span>
          </div>
          <h4 class="toc-title"><a href="article.html?id=${encodeURIComponent(art.id)}" id="${itemElId}">${esc(origTitle)}</a></h4>
          <div class="toc-authors">${authors}</div>
        </div>
        <div class="toc-actions">
          <a href="article.html?id=${encodeURIComponent(art.id)}" class="btn sm yellow">
            ${t('read_article')} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </article>`;
  }

  /* ==========================================================================
     Pages
     ========================================================================== */
  const pages = {};

  /* ---------- Home ---------- */
  pages.home = async () => {
    const [issues, ints, articles] = await Promise.all([
      getAllIssues(),
      loadJSON('data/interviews.json', []),
      getAllArticles()
    ]);
    const sorted = issues;
    const latest = sorted[0];

    $('#heroCover').innerHTML = latest ? `
      <div class="stamp" aria-hidden="true">${t('new_issue')}<b>${latest.issue}</b>${latest.year}</div>
      <button type="button" class="sheet" data-issue="${latest.id}" aria-label="${t('read_latest')}">
        <img src="${esc(latest.coverImage)}" alt="POSH Magazine ${t('issue')} ${latest.issue}" width="900" height="1273" fetchpriority="high">
      </button>` : '';
    bindIssueCards($('#heroCover'), sorted, articles);
    const readBtn = $('#readLatest');
    if (readBtn && latest) readBtn.onclick = () => $('#heroCover [data-issue]')?.click();

    // Render TOC for latest issue
    const homeArticleList = $('#homeArticleList');
    if (homeArticleList && latest) {
      const issueArticles = articles.filter(a => a.issueNo === latest.issue || a.issueId === latest.id);
      const badge = $('#homeTocBadge');
      if (badge) badge.textContent = `${lang === 'es' ? 'NÚMERO' : lang === 'en' ? 'ISSUE' : 'SAYI'} ${latest.issue} (${latest.year})`;
      if (issueArticles.length > 0) {
        homeArticleList.innerHTML = issueArticles.map(renderTocArticleItem).join('');
      } else {
        homeArticleList.innerHTML = `<div class="empty" style="padding:2rem;">${t('no_entries')}</div>`;
      }
    }

    const items = t('ticker');
    const row = items.map(x => `<span>${esc(x)}</span>`).join('');
    $('#ticker').innerHTML = `<div class="ticker-track">${row}${row}${row}${row}</div>`;

    const years = issues.map(i => i.year);
    const first = Math.min(...years);
    const langStatHTML = `<span class="stat-lang">TR · EN · ES</span>`;
    $('#stats').innerHTML = [
      [issues.length, t('stat_issues')], [first, t('stat_since')], [langStatHTML, t('stat_lang')], ['100%', t('stat_free')],
    ].map(([n, l], i) => `<div class="stat reveal" style="--d:${i * .08}s"><b>${n}</b><span>${l}</span></div>`).join('');

    const top3 = sorted.slice(0, 3);
    $('#latestIssues').innerHTML = top3.map((m, idx) => {
      const hasArts = articles.some(a => a.issueNo === m.issue || a.issueId === m.id);
      return issueCard(m, idx, hasArts);
    }).join('');
    bindIssueCards($('#latestIssues'), sorted, articles);

    $('#interviewsHome').innerHTML = ints.slice(0, 2).map(interviewCard).join('');
    bindInterviews($('#interviewsHome'), ints);
    reveal();
  };

  function interviewCard(it, i = 0) {
    const title = pick(it, 'title');
    const desc = pick(it, 'description');
    return `
      <button type="button" class="interview reveal" style="--d:${i * .1}s" data-int="${it.id}">
        <span class="tag y" style="width:fit-content">${t('int_label')}</span>
        <h3>${esc(title)}</h3>
        <p>${esc(desc)}</p>
        <span class="foot mono"><span>${fmtDate(it.date)}</span><span style="display:inline-flex;gap:.5rem;align-items:center">${t('open_int')} <span style="width:18px;display:inline-block">${ICON.arrow}</span></span></span>
      </button>`;
  }
  function bindInterviews(root, list) {
    $$('[data-int]', root).forEach(b => b.addEventListener('click', () => {
      const it = list.find(x => String(x.id) === b.dataset.int); if (!it) return;
      const href = encodeURI(it.pdfUrl);
      openDialog({
        title: pick(it, 'title'), raw: true,
        actionsHTML: `<a class="btn sm yellow" href="${href}" target="_blank" rel="noopener">${t('open_pdf')} ${ICON.ext}</a>`,
        bodyHTML: `<iframe class="pdf-frame" src="${href}#view=FitH" title="${esc(pick(it, 'title'))}"></iframe>`,
      });
    }));
  }

  /* ---------- Issues ---------- */
  pages.issues = async () => {
    const [all, articles] = await Promise.all([
      getAllIssues(),
      getAllArticles()
    ]);
    const years = [...new Set(all.map(i => i.year))].sort((a, b) => b - a);
    const state = pages.issues.state || (pages.issues.state = { year: 'all', q: '' });
    const chips = $('#yearChips');
    chips.innerHTML = [['all', t('all_years'), all.length], ...years.map(y => [String(y), y, all.filter(i => i.year === y).length])]
      .map(([v, l, n]) => `<button type="button" class="chip" data-y="${v}" aria-pressed="${state.year === v}">${l} <span class="n">${n}</span></button>`).join('');
    $$('.chip', chips).forEach(c => c.addEventListener('click', () => { state.year = c.dataset.y; pages.issues(); }));
    const input = $('#q');
    input.value = state.q;
    input.oninput = () => { state.q = input.value; draw(); };
    function draw() {
      const q = state.q.trim().toLowerCase();
      const list = all.filter(m => (state.year === 'all' || String(m.year) === state.year) &&
        (!q || [m.descriptionTR, m.descriptionEN, m.year, 'sayı', 'issue', m.issue, 'no ' + m.issue].join(' ').toLowerCase().includes(q)));
      $('#count').textContent = `${list.length} ${t('results')}`;
      const grid = $('#issuesGrid');
      grid.innerHTML = list.length ? list.map((m, idx) => {
        const hasArts = articles.some(a => a.issueNo === m.issue || a.issueId === m.id);
        return issueCard(m, idx, hasArts);
      }).join('') : `<div class="empty" style="grid-column:1/-1">${t('no_results')}</div>`;
      bindIssueCards(grid, all, articles); reveal(grid);
    }
    draw();
  };

  /* ---------- Editorial ---------- */
  const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toLocaleUpperCase(locale());
  const personPhoto = p => p.photo
    ? `<img src="${esc(encodeURI(p.photo))}" alt="${esc(pick(p, 'name'))}" loading="lazy">`
    : `<span class="initials" aria-hidden="true">${esc(initials(pick(p, 'name')))}</span>`;

  pages.editorial = async () => {
    const data = await loadJSON('CV/authors.json');
    const people = [...data.editors, ...data.associates, ...data.advisory];
    const getRole = p => {
      if (lang === 'es') {
        return p.roleES || (p.roleTR === 'Baş Editör' ? 'Editor en Jefe' : p.roleTR === 'Yardımcı Editör' ? 'Editor Asociado' : p.roleTR === 'Danışma Kurulu Üyesi' ? 'Miembro del Consejo Asesor' : p.roleEN || p.roleTR);
      }
      return pick(p, 'role');
    };
    const personCard = (p, lead = false) => `
      <button type="button" class="person ${lead ? 'lead-card' : ''} reveal" data-p="${p.id}">
        <span class="person-photo">${personPhoto(p)}</span>
        <span>
          <span class="mono role" style="color:var(--orange);display:block;margin-bottom:.5rem">${esc(getRole(p))}</span>
          <h3>${esc(pick(p, 'name'))}</h3>
          ${pick(p, 'bio') ? `<p class="snip" style="margin-top:.7rem">${esc(pick(p, 'bio'))}</p>` : ''}
          <span class="mono" style="display:inline-flex;gap:.5rem;align-items:center;margin-top:1rem;border-bottom:1.5px solid var(--ink);padding-bottom:.2rem">${t('view_profile')} <span style="width:14px;display:inline-block">${ICON.arrow}</span></span>
        </span>
      </button>`;
    const groups = [['role_lead', data.editors, true], ['role_assoc', data.associates, false], ['role_adv', data.advisory, false]];
    $('#people').innerHTML = groups.filter(g => g[1].length).map(([k, arr, lead]) => `
      <section class="people-group">
        ${sectionHead('', t(k)).replace('<span class="eyebrow"></span>', `<span class="eyebrow">${String(arr.length).padStart(2, '0')}</span>`)}
        <div class="people-grid" ${lead ? 'style="grid-template-columns:1fr"' : ''}>${arr.map(p => personCard(p, lead)).join('')}</div>
      </section>`).join('');
    $$('[data-p]').forEach(b => b.addEventListener('click', () => {
      const p = people.find(x => String(x.id) === b.dataset.p); if (!p) return;
      const cv = lang === 'es' ? (p.cvDocxES || p.cvDocxEN || p.cvDocxTR) : lang === 'en' ? p.cvDocxEN : p.cvDocxTR;
      const bio = pick(p, 'bio');
      const acts = [
        cv ? `<a class="btn sm yellow" href="${esc(encodeURI(cv))}" download>${t('cv')} ${ICON.download}</a>` : '',
        p.email ? `<a class="btn sm ghost" href="mailto:${esc(p.email)}">${t('email')} ${ICON.mail}</a>` : '',
        p.linkedin ? `<a class="btn sm ghost" href="${esc(/^https?:/.test(p.linkedin) ? p.linkedin : 'https://' + p.linkedin)}" target="_blank" rel="noopener">${t('linkedin')} ${ICON.ext}</a>` : '',
      ].join('');
      openDialog({
        title: pick(p, 'name'),
        bodyHTML: `<div class="bio-layout"><div class="person-photo">${personPhoto(p)}</div>
          <div><h2>${esc(pick(p, 'name'))}</h2><span class="mono role">${esc(getRole(p))}</span>
          ${bio ? `<p class="bio">${esc(bio)}</p>` : ''}<div class="acts">${acts}</div></div></div>`,
      });
    }));
    reveal();
  };

  /* ---------- Legislation ---------- */
  const LEG_SECTIONS = ['contracts', 'laws', 'decrees', 'regulations', 'bylaws', 'communiques'];
  const rgDate = it => {
    if (it.rgDate) return new Date(it.rgDate).getTime();
    const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(it.rgText || '');
    return m ? new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime() : 0;
  };
  pages.legislation = async () => {
    const data = await loadJSON('data/legislation.json');
    const st = pages.legislation.state || (pages.legislation.state = { sec: 'communiques', sort: 'alpha', q: '' });
    const tabs = $('#legTabs');
    tabs.innerHTML = LEG_SECTIONS.map(s => `<button type="button" class="chip" data-s="${s}" aria-pressed="${st.sec === s}">${t('sec_' + s)} <span class="n">${(data[s] || []).length}</span></button>`).join('');
    $$('.chip', tabs).forEach(c => c.addEventListener('click', () => { st.sec = c.dataset.s; pages.legislation(); }));
    const sortBox = $('#legSort');
    sortBox.innerHTML = ['alpha', 'chrono'].map(s => `<button type="button" class="chip" data-o="${s}" aria-pressed="${st.sort === s}">${t('sort_' + s)}</button>`).join('');
    $$('.chip', sortBox).forEach(c => c.addEventListener('click', () => { st.sort = c.dataset.o; pages.legislation(); }));
    const input = $('#q'); input.value = st.q; input.oninput = () => { st.q = input.value; draw(); };
    $('#legHead').innerHTML = `<span>${t('col_title')}</span><span>${t('col_mbs')}</span><span>${t('col_kaysis')}</span><span>${t('col_rg')}</span>`;

    function draw() {
      const ttl = it => (lang === 'en' ? (it.titleEn || it.title || it.titleTr) : (it.titleTr || it.title)) || '';
      let list = [...(data[st.sec] || [])];
      const q = st.q.trim().toLocaleLowerCase(locale());
      if (q) list = list.filter(it => (ttl(it) + ' ' + (it.rgText || '')).toLocaleLowerCase(locale()).includes(q));
      list.sort(st.sort === 'alpha' ? (a, b) => ttl(a).localeCompare(ttl(b), lang) : (a, b) => rgDate(b) - rgDate(a));
      $('#count').textContent = `${list.length} ${t('results')}`;
      $('#legRows').innerHTML = list.length ? list.map(it => {
        const title = it.title || it.titleTr || '';
        const mbs = it.mbsUrl || (title ? 'https://www.mevzuat.gov.tr/aramasonuc?AranacakMetin=' + encodeURIComponent(title) : '');
        const kay = it.kaysisUrl || (title ? 'https://www.google.com/search?q=site%3Akms.kaysis.gov.tr+' + encodeURIComponent(title) : 'https://kms.kaysis.gov.tr/Home/Kurum/24304011');
        const rg = it.rgText || (it.rgDate ? 'RG ' + new Date(it.rgDate).toLocaleDateString('tr-TR') : '');
        return `<div class="leg-row"><div class="leg-title">${esc(ttl(it))}</div>
          <div>${mbs ? `<a class="pill-link" href="${esc(mbs)}" target="_blank" rel="noopener">${t('mbs_link')} ${ICON.ext}</a>` : ''}</div>
          <div><a class="pill-link" href="${esc(kay)}" target="_blank" rel="noopener">${t('kaysis_link')} ${ICON.ext}</a></div>
          <div class="leg-rg"><span class="leg-lbl">${t('col_rg')}: </span>${esc(rg)}</div></div>`;
      }).join('') : `<div class="empty" style="margin-top:1.5rem">${t('no_entries')}</div>`;
    }
    draw();
  };

  /* ---------- Links ---------- */
  pages.links = async () => {
    const groups = await loadJSON('data/links.json');
    const st = pages.links.state || (pages.links.state = { g: 'all', q: '' });
    const chips = $('#linkChips');
    chips.innerHTML = [['all', t('all_years'), groups.reduce((n, g) => n + g.items.length, 0)], ...groups.map((g, i) => [String(i), g[lang], g.items.length])]
      .map(([v, l, n]) => `<button type="button" class="chip" data-g="${v}" aria-pressed="${st.g === v}">${esc(l)} <span class="n">${n}</span></button>`).join('');
    $$('.chip', chips).forEach(c => c.addEventListener('click', () => { st.g = c.dataset.g; pages.links(); }));
    const input = $('#q'); input.value = st.q; input.oninput = () => { st.q = input.value; draw(); };
    function draw() {
      const q = st.q.trim().toLocaleLowerCase(locale());
      let total = 0;
      const html = groups.map((g, gi) => {
        if (st.g !== 'all' && st.g !== String(gi)) return '';
        const items = g.items.filter(i => !q || (i['name' + (lang === 'en' ? 'En' : 'Tr')] + ' ' + i['desc' + (lang === 'en' ? 'En' : 'Tr')]).toLocaleLowerCase(locale()).includes(q));
        if (!items.length) return '';
        total += items.length;
        return `<section class="link-group"><h2><span>${String(gi + 1).padStart(2, '0')}</span>${esc(g[lang])}</h2>
          <ul class="link-list">${items.map(i => `<li><a class="link-item" href="${esc(i.url)}" target="_blank" rel="noopener">
            <h3>${esc(lang === 'en' ? i.nameEn : i.nameTr)}</h3><p>${esc(lang === 'en' ? i.descEn : i.descTr)}</p><span class="go">${ICON.ext}</span></a></li>`).join('')}</ul></section>`;
      }).join('');
      $('#linkGroups').innerHTML = html || `<div class="empty">${t('no_results')}</div>`;
      $('#count').textContent = `${total} ${t('results')}`;
    }
    draw();
  };

  /* ---------- Interviews ---------- */
  pages.interviews = async () => {
    const ints = await loadJSON('data/interviews.json', []);
    const list = [...ints].sort((a, b) => new Date(b.date) - new Date(a.date));
    $('#interviewsGrid').innerHTML = list.map(interviewCard).join('') || `<div class="empty">${t('no_entries')}</div>`;
    bindInterviews($('#interviewsGrid'), list);
    reveal();
  };

  /* ---------- About ---------- */
  pages.about = async () => {
    reveal();
  };

  /* ---------- Contact ---------- */
  pages.contact = async () => {
    const cards = [['editor@poshmagazine.org', 'c_editor', 'c_editor_d'], ['webmaster@poshmagazine.org', 'c_web', 'c_web_d']];
    $('#contactGrid').innerHTML = cards.map(([a, h, d], i) => `
      <article class="contact-card reveal" style="--d:${i * .1}s">
        <span class="mono" style="color:var(--orange)">${String(i + 1).padStart(2, '0')}</span>
        <h2>${t(h)}</h2><p>${t(d)}</p>
        <a class="addr" href="mailto:${a}">${a}</a>
        <div class="actions">
          <a class="btn sm yellow" href="mailto:${a}">${t('send_mail')} ${ICON.mail}</a>
          <button type="button" class="btn sm ghost" data-copy="${a}">${t('copy')} ${ICON.copy}</button>
        </div>
      </article>`).join('');
    $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); } catch { /* ignore */ }
      const old = b.innerHTML; b.innerHTML = `${t('copied')} ✓`;
      setTimeout(() => { b.innerHTML = old; }, 1600);
    }));
    reveal();
  };

  /* ---------- Calendar ---------- */
  const FIXED = {
    '01-01': { tr: 'Yılbaşı', en: "New Year's Day", k: 'hol' },
    '04-23': { tr: 'Ulusal Egemenlik ve Çocuk Bayramı', en: "National Sovereignty and Children's Day", k: 'hol' },
    '04-28': { tr: 'Dünya İş Sağlığı ve Güvenliği Günü', en: 'World Day for Safety and Health at Work', k: 'osh' },
    '05-01': { tr: 'Emek ve Dayanışma Günü', en: "International Workers' Day", k: 'hol' },
    '05-04': { tr: 'İSG Haftası başlangıcı (4–10 Mayıs)', en: 'OSH Week begins (4–10 May)', k: 'osh' },
    '05-05': { tr: 'İş Sağlığı ve Güvenliği Haftası', en: 'OSH Week (TR)', k: 'osh' },
    '05-06': { tr: 'İş Sağlığı ve Güvenliği Haftası', en: 'OSH Week (TR)', k: 'osh' },
    '05-07': { tr: 'İş Sağlığı ve Güvenliği Haftası', en: 'OSH Week (TR)', k: 'osh' },
    '05-08': { tr: 'İş Sağlığı ve Güvenliği Haftası', en: 'OSH Week (TR)', k: 'osh' },
    '05-09': { tr: 'İş Sağlığı ve Güvenliği Haftası', en: 'OSH Week (TR)', k: 'osh' },
    '05-10': { tr: 'İSG Haftası sonu', en: 'OSH Week ends (TR)', k: 'osh' },
    '05-19': { tr: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı', en: 'Commemoration of Atatürk, Youth and Sports Day', k: 'hol' },
    '07-15': { tr: 'Demokrasi ve Millî Birlik Günü', en: 'Democracy and National Unity Day', k: 'hol' },
    '08-30': { tr: 'Zafer Bayramı', en: 'Victory Day', k: 'hol' },
    '10-29': { tr: 'Cumhuriyet Bayramı', en: 'Republic Day', k: 'hol' },
    '11-01': { tr: 'Azizler Günü (AB)', en: "All Saints' Day (EU)", k: 'hol' },
    '12-25': { tr: 'Noel (AB)', en: 'Christmas Day (EU)', k: 'hol' },
    '12-26': { tr: 'Aziz Stefan Günü / Boxing Day (AB)', en: "St. Stephen's Day / Boxing Day (EU)", k: 'hol' },
  };
  const eid = (y, m, d, n, kind) => { // helper: n consecutive days
    const o = {};
    for (let i = 0; i < n; i++) o[`${y}-${String(m).padStart(2, '0')}-${String(d + i).padStart(2, '0')}`] = kind(i);
    return o;
  };
  const RF = i => ({ tr: `Ramazan Bayramı ${i + 1}. Gün`, en: `Eid al-Fitr Day ${i + 1}`, k: 'hol' });
  const KB = i => ({ tr: `Kurban Bayramı ${i + 1}. Gün`, en: `Eid al-Adha Day ${i + 1}`, k: 'hol' });
  const DATED = {
    // 2025
    '2025-03-29': { tr: 'Ramazan Bayramı Arifesi', en: 'Eid al-Fitr Eve', k: 'hol' }, ...eid(2025, 3, 30, 2, RF), '2025-04-01': { tr: 'Ramazan Bayramı 3. Gün', en: 'Eid al-Fitr Day 3', k: 'hol' },
    '2025-04-18': { tr: 'Kutsal Cuma (AB)', en: 'Good Friday (EU)', k: 'hol' }, '2025-04-21': { tr: 'Paskalya Pazartesisi (AB)', en: 'Easter Monday (EU)', k: 'hol' },
    '2025-06-05': { tr: 'Kurban Bayramı Arifesi', en: 'Eid al-Adha Eve', k: 'hol' }, ...eid(2025, 6, 6, 4, KB),
    // 2026
    '2026-03-19': { tr: 'Ramazan Bayramı Arifesi', en: 'Eid al-Fitr Eve', k: 'hol' }, ...eid(2026, 3, 20, 3, RF),
    '2026-04-03': { tr: 'Kutsal Cuma (AB)', en: 'Good Friday (EU)', k: 'hol' }, '2026-04-06': { tr: 'Paskalya Pazartesisi (AB)', en: 'Easter Monday (EU)', k: 'hol' },
    '2026-05-26': { tr: 'Kurban Bayramı Arifesi', en: 'Eid al-Adha Eve', k: 'hol' }, ...eid(2026, 5, 27, 4, KB),
  };

  pages.calendar = async () => {
    const custom = await loadJSON('data/events.json', []);
    const now = new Date();
    const st = pages.calendar.state || (pages.calendar.state = { y: now.getFullYear(), m: now.getMonth(), sel: null });
    const pad = n => String(n).padStart(2, '0');
    const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
    const eventsOn = (y, m, d) => {
      const k = key(y, m, d), out = [];
      if (DATED[k]) out.push(DATED[k]);
      const f = FIXED[`${pad(m + 1)}-${pad(d)}`]; if (f) out.push(f);
      custom.filter(e => e.date === k).forEach(e => out.push({ tr: e.tr || e.title, en: e.en || e.title, k: 'event' }));
      return out;
    };
    const kindLbl = k => t('t_' + k);

    function render() {
      $('#calTitle').innerHTML = `${t('months')[st.m]} <small>${st.y}</small>`;
      $('#calDow').innerHTML = t('dow').map(d => `<div>${d}</div>`).join('');
      const first = new Date(st.y, st.m, 1);
      const lead = (first.getDay() + 6) % 7;
      const days = new Date(st.y, st.m + 1, 0).getDate();
      const total = Math.ceil((lead + days) / 7) * 7;
      let html = '';
      for (let i = 0; i < total; i++) {
        const dt = new Date(st.y, st.m, 1 - lead + i);
        const y = dt.getFullYear(), m = dt.getMonth(), d = dt.getDate();
        const out = m !== st.m;
        const ev = eventsOn(y, m, d);
        const k = key(y, m, d);
        const isToday = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
        const wk = (i % 7) >= 5;
        html += `<button type="button" class="cal-cell${out ? ' out' : ''}${isToday ? ' today' : ''}${wk ? ' wknd' : ''}${st.sel === k ? ' sel' : ''}" data-k="${k}" aria-label="${d} ${t('months')[m]} ${y}">
          <span class="d">${d}</span><span class="dots">${ev.map(e => `<span class="dot ${e.k === 'osh' ? 'osh' : ''}" style="${e.k === 'event' ? 'background:var(--ink)' : ''}"></span>`).join('')}</span></button>`;
      }
      $('#calGrid').innerHTML = html;
      $$('#calGrid .cal-cell').forEach(c => c.addEventListener('click', () => { st.sel = c.dataset.k; render(); }));

      // side panel
      const list = (y, m, d) => eventsOn(y, m, d).map(e => `<div class="ev"><span class="when">${d}</span><span class="what">${esc(lang === 'en' ? e.en : e.tr)}<small>${kindLbl(e.k)}</small></span></div>`).join('');
      let sel = '';
      if (st.sel) {
        const [y, m, d] = st.sel.split('-').map(Number);
        const ev = eventsOn(y, m - 1, d);
        sel = `<h4>${t('selected_day')} · ${d} ${t('months')[m - 1]} ${y}</h4>` + (ev.length ? ev.map(e => `<div class="ev"><span class="what">${esc(lang === 'en' ? e.en : e.tr)}<small>${kindLbl(e.k)}</small></span></div>`).join('') : `<p class="no-ev">${t('nothing')}</p>`);
      } else sel = `<h4>${t('selected_day')}</h4><p class="no-ev">${t('pick_day')}</p>`;
      let month = '';
      for (let d = 1; d <= days; d++) month += list(st.y, st.m, d);
      $('#calSide').innerHTML = `<h3>${t('months')[st.m]} ${st.y}</h3>${sel}<h4>${t('this_month')}</h4>${month || `<p class="no-ev">${t('nothing')}</p>`}`;
    }
    $('#calPrev').onclick = () => { st.m--; if (st.m < 0) { st.m = 11; st.y--; } render(); };
    $('#calNext').onclick = () => { st.m++; if (st.m > 11) { st.m = 0; st.y++; } render(); };
    $('#calToday').onclick = () => { st.y = now.getFullYear(); st.m = now.getMonth(); st.sel = key(st.y, st.m, now.getDate()); render(); };
    render();
  };

  /* ---------- Article (Single View) ---------- */
  pages.article = async () => {
    const params = new URLSearchParams(window.location.search);
    const artId = params.get('id');
    const container = $('#articleContainer');
    if (!container) return;

    const [articles, issues] = await Promise.all([
      getAllArticles(),
      getAllIssues()
    ]);

    const article = articles.find(a => a.id === artId);
    if (!article) {
      container.innerHTML = `<div class="empty" style="margin:4rem 0;">${t('article_not_found')} <br><br><a href="index.html" class="btn sm yellow">← ${t('title_home')}</a></div>`;
      return;
    }

    // increment view count
    article.views = (article.views || 0) + 1;
    saveArticleToLocal(article);

    const sourceLang = article.originalLang || (article.titleTR ? 'tr' : article.titleEN ? 'en' : 'tr');
    const isDifferentLang = (lang !== sourceLang);

    // Initial values
    const origTitle = article.title || article.titleTR || article.titleEN || article.titleES || '';
    const origAbstract = article.abstract || article.abstractTR || article.abstractEN || article.abstractES || '';
    const origKeywords = article.keywords || article['keywords' + sourceLang.toUpperCase()] || article.keywordsTR || article.keywordsEN || [];
    let origBody = article.htmlContent || '';
    if (!origBody && article.sections && article.sections.length) {
      origBody = article.sections.map((sec, idx) => {
        const h = sec.headingTR || sec.headingEN || '';
        const c = sec.contentTR || sec.contentEN || '';
        return `<section class="article-section" id="sec-${idx}"><h2>${esc(h)}</h2><div>${c}</div></section>`;
      }).join('');
    }

    // Pre-authored translation check
    const hasPreAuthoredTitle = Boolean(article['title' + lang.toUpperCase()]);
    const hasPreAuthoredAbstract = Boolean(article['abstract' + lang.toUpperCase()]);

    let activeTitle = (isDifferentLang && hasPreAuthoredTitle) ? article['title' + lang.toUpperCase()] : origTitle;
    let activeAbstract = (isDifferentLang && hasPreAuthoredAbstract) ? article['abstract' + lang.toUpperCase()] : origAbstract;
    let activeKeywords = (isDifferentLang && article['keywords' + lang.toUpperCase()]?.length) ? article['keywords' + lang.toUpperCase()] : origKeywords;
    let activeBody = origBody;

    const type = lang === 'es' ? (article.articleTypeES || article.articleType || 'Artículo de Investigación') : lang === 'en' ? (article.articleType || 'Research Article') : (article.articleTypeTR || article.articleType || 'Araştırma Makalesi');
    const issueObj = issues.find(i => i.issue === article.issueNo || i.id === article.issueId);
    const issueName = issueObj ? `${t('issue')} ${article.issueNo} (${article.year})` : `${t('issue')} ${article.issueNo}`;

    // Authors block with ORCID & Affiliation
    const authorsHTML = (article.authors || []).map(a => `
      <div class="author-pill">
        <span class="author-name">
          ${esc(a.name)}
          ${a.orcid ? `<a href="https://orcid.org/${esc(a.orcid)}" target="_blank" rel="noopener" title="ORCID: ${esc(a.orcid)}">
            <svg class="orcid-icon" viewBox="0 0 256 256"><path d="M128,0A128,128,0,1,0,256,128,128,128,0,0,0,128,0ZM86.35,186.26H61.64V76.12h24.7ZM74,62.88A14.39,14.39,0,1,1,88.38,48.5,14.39,14.39,0,0,1,74,62.88Zm120.25,65.88c0,32.74-19.64,48.6-49.88,48.6H109.11V76.12h37.49C175.76,76.12,194.24,94,194.24,128.76Zm-24.83,0c0-21.84-10.74-32.06-28.53-32.06H132.89v64.12h7.8C158.48,160.82,169.41,150.81,169.41,128.76Z"/></svg>
          </a>` : ''}
        </span>
        <span class="author-affil">${esc(a.affiliation || a.affiliationTR || a.affiliationEN || '')}</span>
      </div>`).join('');

    function buildOutline(html) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const headings = tmp.querySelectorAll('h1, h2, h3, h4');
      let out = '';
      headings.forEach((h, idx) => {
        const id = `sec-${idx}`;
        h.id = id;
        out += `<a href="#${id}">${esc(h.textContent.trim())}</a>`;
      });
      return { outlineHTML: out, bodyHTML: tmp.innerHTML };
    }

    const { outlineHTML, bodyHTML } = buildOutline(activeBody);

    // References list
    const refsHTML = (article.references || []).map(r => `<li>${esc(r)}</li>`).join('');

    // Translation Protocol Bar HTML
    const protocolBarHTML = isDifferentLang ? `
      <div class="translation-protocol-bar" id="transProtocolBar">
        <div class="trans-status">
          <span class="trans-badge">🌐 ${lang === 'es' ? 'PROTOCOLO DE TRADUCCIÓN' : lang === 'en' ? 'TRANSLATION PROTOCOL' : 'ÇEVİRİ PROTOKOLÜ'}</span>
          <span id="transStatusText">
            ${lang === 'es' ? `Traducción automática: <strong>${langName(sourceLang)}</strong> → <strong>${langName(lang)}</strong>` : lang === 'en' ? `Automatic translation: <strong>${langName(sourceLang)}</strong> → <strong>${langName(lang)}</strong>` : `Otomatik çeviri protokolü: <strong>${langName(sourceLang)}</strong> → <strong>${langName(lang)}</strong>`}
            <span class="trans-loading-indicator" id="transIndicator" style="display:none;margin-left:.6rem;">⏳ ${lang === 'es' ? 'Traduciendo...' : lang === 'en' ? 'Translating...' : 'Çevriliyor...'}</span>
          </span>
        </div>
        <div class="trans-actions">
          <button type="button" class="btn sm ghost" id="toggleTransBtn">
            📄 ${lang === 'es' ? `Ver en idioma original (${sourceLang.toUpperCase()})` : lang === 'en' ? `View in original language (${sourceLang.toUpperCase()})` : `Orijinal dilde göster (${sourceLang.toUpperCase()})`}
          </button>
        </div>
      </div>
    ` : '';

    container.innerHTML = `
      <article class="article-container">
        <header class="article-header">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;">
            <div class="crumb mono"><a href="index.html">POSH</a><span>/</span><a href="issues.html">${t('nav_issues')}</a><span>/</span><b>${esc(issueName)}</b></div>
            <div style="display:flex;gap:.6rem;">
              <button type="button" class="btn sm ghost" id="citeBtn">${t('cite_article')} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M5 15V6a2 2 0 0 1 2-2h9"/><rect x="9" y="9" width="11" height="11" rx="2"/></svg></button>
              <button type="button" class="btn sm yellow" onclick="window.print()">Print / PDF <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
            </div>
          </div>
          ${protocolBarHTML}
          <span class="article-type-badge">${esc(type)}</span>
          <h1 class="article-headline" id="artHeadline">${esc(activeTitle)}</h1>
          <div class="article-authors-block">${authorsHTML}</div>
          <div class="article-metadata-ribbon">
            <div><b>${t('published_in')}</b>${esc(issueName)}</div>
            ${article.receivedDate ? `<div><b>${t('received')}</b>${fmtDate(article.receivedDate)}</div>` : ''}
            ${article.acceptedDate ? `<div><b>${t('accepted')}</b>${fmtDate(article.acceptedDate)}</div>` : ''}
            <div><b>${t('published')}</b>${fmtDate(article.publishDate)}</div>
          </div>
        </header>

        <div class="article-layout">
          <aside class="article-sidebar">
            <div class="article-nav-card">
              <h4>${t('outline')}</h4>
              <nav class="article-outline" id="artOutline">
                <a href="#abstract" class="active">Abstract</a>
                ${outlineHTML}
                ${article.references?.length ? `<a href="#references">${t('references')}</a>` : ''}
              </nav>
            </div>
            <div class="article-metrics">
              <div class="metric-box">
                <b id="artViewCount">${article.views || 0}</b>
                <span>${t('views')}</span>
              </div>
              <div class="metric-box">
                <b>${article.downloads || 0}</b>
                <span>${t('downloads')}</span>
              </div>
            </div>
          </aside>

          <div class="article-body">
            <div class="abstract-box" id="abstract">
              <h3>ABSTRACT / ÖZET</h3>
              <p id="artAbstractText">${esc(activeAbstract)}</p>
              <div class="keywords-list" id="artKeywordsList" style="${activeKeywords.length ? '' : 'display:none;'}">
                <span class="mono" style="font-weight:700;color:var(--ink);">${t('keywords')}:</span>
                ${activeKeywords.map(k => `<span class="tag">${esc(k)}</span>`).join('')}
              </div>
            </div>

            <div class="article-content-flow" id="artContentFlow">
              ${bodyHTML}
            </div>

            ${refsHTML ? `
              <section class="article-section" id="references" style="margin-top:2.5rem;">
                <h2>${t('references')}</h2>
                <ol class="references-list">${refsHTML}</ol>
              </section>` : ''}
          </div>
        </div>
      </article>`;

    // Citation button handler
    $('#citeBtn')?.addEventListener('click', () => {
      const authorList = (article.authors || []).map(a => a.name).join(', ');
      const citationText = `${authorList} (${article.year}). ${activeTitle}. POSH Magazine (Progress in Occupational Safety and Health), ${t('issue')} ${article.issueNo}.`;
      navigator.clipboard.writeText(citationText);
      alert(t('citation_copied') + '\n\n' + citationText);
    });

    // Dynamic Translation Execution & Toggle
    if (isDifferentLang) {
      let showingOriginal = false;
      let translatedTitle = activeTitle;
      let translatedAbstract = activeAbstract;
      let translatedKeywords = [...activeKeywords];
      let translatedBody = bodyHTML;

      const ind = $('#transIndicator');
      const toggleBtn = $('#toggleTransBtn');

      // If not pre-authored, translate dynamically
      if (!hasPreAuthoredTitle || !hasPreAuthoredAbstract) {
        if (ind) ind.style.display = 'inline-block';

        (async () => {
          try {
            // 1. Translate Title
            if (!hasPreAuthoredTitle && origTitle) {
              translatedTitle = await translateText(origTitle, sourceLang, lang);
              if (!showingOriginal) $('#artHeadline').textContent = translatedTitle;
            }

            // 2. Translate Abstract
            if (!hasPreAuthoredAbstract && origAbstract) {
              translatedAbstract = await translateText(origAbstract, sourceLang, lang);
              if (!showingOriginal) $('#artAbstractText').textContent = translatedAbstract;
            }

            // 3. Translate Keywords
            if (origKeywords.length) {
              const kwPromises = origKeywords.map(k => translateText(k, sourceLang, lang));
              translatedKeywords = await Promise.all(kwPromises);
              if (!showingOriginal && $('#artKeywordsList')) {
                $('#artKeywordsList').innerHTML = `
                  <span class="mono" style="font-weight:700;color:var(--ink);">${t('keywords')}:</span>
                  ${translatedKeywords.map(k => `<span class="tag">${esc(k)}</span>`).join('')}
                `;
              }
            }

            // 4. Translate Body Content
            if (origBody) {
              const transBody = await translateHtmlContent(origBody, sourceLang, lang);
              const { outlineHTML: newOut, bodyHTML: newBody } = buildOutline(transBody);
              translatedBody = newBody;
              if (!showingOriginal) {
                $('#artContentFlow').innerHTML = newBody;
                $('#artOutline').innerHTML = `<a href="#abstract" class="active">Abstract</a>${newOut}${article.references?.length ? `<a href="#references">${t('references')}</a>` : ''}`;
              }
            }
          } catch (err) {
            console.warn('[TranslationProtocol] dynamic translation finished with notice:', err);
          } finally {
            if (ind) ind.style.display = 'none';
          }
        })();
      }

      // Toggle Original / Translated button handler
      toggleBtn?.addEventListener('click', () => {
        showingOriginal = !showingOriginal;
        if (showingOriginal) {
          // Switch to Original
          $('#artHeadline').textContent = origTitle;
          $('#artAbstractText').textContent = origAbstract;
          if ($('#artKeywordsList')) {
            $('#artKeywordsList').innerHTML = `
              <span class="mono" style="font-weight:700;color:var(--ink);">${t('keywords')}:</span>
              ${origKeywords.map(k => `<span class="tag">${esc(k)}</span>`).join('')}
            `;
          }
          const { outlineHTML: origOut, bodyHTML: origB } = buildOutline(origBody);
          $('#artContentFlow').innerHTML = origB;
          $('#artOutline').innerHTML = `<a href="#abstract" class="active">Abstract</a>${origOut}${article.references?.length ? `<a href="#references">${t('references')}</a>` : ''}`;

          toggleBtn.innerHTML = `🌐 ${lang === 'es' ? `Ver traducción (${lang.toUpperCase()})` : lang === 'en' ? `View translation (${lang.toUpperCase()})` : `Çeviriyi göster (${lang.toUpperCase()})`}`;
        } else {
          // Switch to Translated
          $('#artHeadline').textContent = translatedTitle;
          $('#artAbstractText').textContent = translatedAbstract;
          if ($('#artKeywordsList')) {
            $('#artKeywordsList').innerHTML = `
              <span class="mono" style="font-weight:700;color:var(--ink);">${t('keywords')}:</span>
              ${translatedKeywords.map(k => `<span class="tag">${esc(k)}</span>`).join('')}
            `;
          }
          const { outlineHTML: transOut, bodyHTML: transB } = buildOutline(translatedBody);
          $('#artContentFlow').innerHTML = transB;
          $('#artOutline').innerHTML = `<a href="#abstract" class="active">Abstract</a>${transOut}${article.references?.length ? `<a href="#references">${t('references')}</a>` : ''}`;

          toggleBtn.innerHTML = `📄 ${lang === 'es' ? `Ver en idioma original (${sourceLang.toUpperCase()})` : lang === 'en' ? `View in original language (${sourceLang.toUpperCase()})` : `Orijinal dilde göster (${sourceLang.toUpperCase()})`}`;
        }
      });
    }
  };

  // Admin panel code has been moved to its own dedicated file: admin/admin.js

  /* ==========================================================================
     Boot
     ========================================================================== */
  function renderPage() {
    const fn = pages[page];
    if (!fn) return;
    fn().catch(err => {
      console.error(err);
      const m = $('#main');
      if (m && !m.dataset.err) {
        m.dataset.err = '1';
        m.insertAdjacentHTML('beforeend', `<div class="wrap loading">⚠ Veri yüklenemedi. Siteyi bir web sunucusu üzerinden açın (file:// ile JSON okunamaz).</div>`);
      }
    });
  }

  renderChrome();
  applyI18n();
  reveal();
  renderPage();
})();
