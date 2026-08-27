/**
 * Fund-house (AMC) slug → official website domain, used by scripts/build-logos.ts to fetch
 * each house's logo from a logo API (Logo.dev / Brandfetch) into public/logos/amc/.
 *
 * EDIT ME: add or correct domains here. Any house not listed (or whose logo the API can't
 * resolve) simply keeps its generated initials avatar — partial coverage is fine.
 *
 * Keys are the slug shown in /amc/<slug> URLs. Values are the AMC's primary domain (the
 * logo API resolves a brand logo from the domain, so the registrable domain is enough).
 */
export const AMC_DOMAINS: Record<string, string> = {
  "icici-prudential": "icicipruamc.com",
  "nippon-india": "nipponindiamf.com",
  sbi: "sbimf.com",
  "kotak-mahindra": "kotakmf.com",
  "motilal-oswal": "motilaloswalmf.com",
  "aditya-birla-sun-life": "adityabirlacapital.com",
  bandhan: "bandhanmutual.com",
  axis: "axismf.com",
  dsp: "dspim.com",
  uti: "utimf.com",
  hdfc: "hdfcfund.com",
  tata: "tatamutualfund.com",
  edelweiss: "edelweissmf.com",
  "mirae-asset": "miraeassetmf.co.in",
  hsbc: "assetmanagement.hsbc.co.in",
  groww: "groww.in",
  lic: "licmf.com",
  invesco: "invescomutualfund.com",
  sundaram: "sundarammutual.com",
  "franklin-templeton": "franklintempletonindia.com",
  union: "unionmf.com",
  "canara-robeco": "canararobeco.com",
  quant: "quantmutual.com",
  "jm-financial": "jmfinancialmf.com",
  "mahindra-manulife": "mahindramanulife.com",
  "pgim-india": "pgimindiamf.com",
  "bajaj-finserv": "bajajfinserv.in",
  navi: "navimutualfund.com",
  "whiteoak-capital": "whiteoakamc.com",
  quantum: "quantumamc.com",
  "360-one": "360.one",
  zerodha: "zerodha.com",
  ppfas: "ppfas.com",
  "angel-one": "angelone.in",

  // Domains below are less certain — verify before relying on them, or leave the house to
  // fall back to its initials avatar. Uncomment/correct as you confirm each:
  // "baroda-bnp-paribas": "barodabnpparibasmf.in",
  // "bank-of-india": "boimf.in",
  // iti: "itimf.com",
  // trust: "trustmf.com",
  // samco: "samco.in",
  // nj: "njmutualfund.com",
  // taurus: "taurusmutualfund.com",
  // shriram: "shriramamc.com",
  // helios: "helioscapital.in",
  // "jio-blackrock": "jioblackrock.com",
  // abakkus: "abakkusmf.com",
  // "the-wealth-company": "thewealthcompany.com",
};
