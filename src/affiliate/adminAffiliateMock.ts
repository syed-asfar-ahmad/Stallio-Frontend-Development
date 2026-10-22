
import type {
  AdminAffiliate,
  AdminCommission,
  AdminReferral,
  AffiliateProgramSettings,
  CommissionStatus,
  PayoutBatch,
  PayoutBatchItem,
  PayoutCandidate,
  PayoutMethodType,
  ReferralReviewAction,
  ReferralStatus,
  SubscriptionReferralAttribution,
} from './types';
import { DEFAULT_PROGRAM_SETTINGS } from './affiliateMock';
import { setCustomReservedSlugs } from '../lib/reservedWords';

const STORAGE_KEY = 'stallio_admin_affiliate_mock_v1';
const DAY = 86_400_000;

const PLAN = {
  monthly: { name: 'Basic Monthly ($5/mo)', cents: 500 },
  yearly: { name: 'Business Yearly ($50/yr)', cents: 5000 },
} as const;

type StoredAffiliate = Omit<AdminAffiliate, 'metrics'> & { clicks: number };

interface State {
  affiliates: StoredAffiliate[];
  referrals: AdminReferral[];
  commissions: AdminCommission[];
  batches: PayoutBatch[];
  settings: AffiliateProgramSettings;
}

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY).toISOString();
const isoAhead = (days: number) => new Date(Date.now() + days * DAY).toISOString();

// ----------------------------------------------------------------------------
// Seed data
// ----------------------------------------------------------------------------

function seed(): State {
  const settings = { ...DEFAULT_PROGRAM_SETTINGS, customReservedWords: ['partner', 'giveaway'] };

  const mkAff = (
    id: string,
    name: string,
    email: string,
    code: string,
    createdAgo: number,
    clicks: number,
    method: [PayoutMethodType, string] | null,
    extra: Partial<StoredAffiliate> = {},
  ): StoredAffiliate => ({
    id,
    name,
    email,
    status: 'active',
    primaryCode: code,
    referralLink: `https://stallio.shop/r/${code}`,
    aliasCodes: [],
    termsAcceptedAt: iso(createdAgo),
    createdAt: iso(createdAgo),
    clicks,
    payoutMethod: method
      ? { type: method[0], last4: method[1].slice(-4), destination: method[1] }
      : null,
    ...extra,
  });

  const affiliates: StoredAffiliate[] = [
    mkAff('aff_sarah_01', 'Sarah Jenkins', 'sarah@example.com', 'sarah25', 120, 1840, ['bank_transfer', 'GB29NWBK60161331924892'], {
      aliasCodes: ['sarah-jenkins', 'sj-launch'],
    }),
    mkAff('aff_ahmad_02', 'Ahmad Raza', 'ahmad@raza.pk', 'ahmad', 96, 2310, ['bank_transfer', 'PK36SCBL0000001123457731'], {
      aliasCodes: ['ahmad-raza'],
    }),
    mkAff('aff_lina_03', 'Lina Moreau', 'lina@moreau.fr', 'linam', 84, 960, ['paypal', 'lina@moreau.fr']),
    mkAff('aff_omar_04', 'Omar Haddad', 'omar@haddad.ae', 'omar-h', 77, 1420, ['wise', 'omar@haddad.ae']),
    mkAff('aff_priya_05', 'Priya Nair', 'priya@nair.in', 'priya-n', 60, 702, ['bank_transfer', 'IN12HDFC0001234560912']),
    mkAff('aff_diego_06', 'Diego Alvarez', 'diego@alvarez.mx', 'diegoa', 55, 411, ['paypal', 'diego@alvarez.mx'], {
      status: 'suspended',
      suspendedAt: iso(9),
      suspendedReason: 'Repeated self-referral attempts.',
    }),
    mkAff('aff_mei_07', 'Mei Tanaka', 'mei@tanaka.jp', 'meitanaka', 33, 288, ['paypal', 'mei@tanaka.jp']),
    mkAff('aff_noah_08', 'Noah Becker', 'noah@becker.de', 'noahb', 21, 174, null),
  ];

  const byId = (id: string) => affiliates.find((a) => a.id === id)!;
  const referrals: AdminReferral[] = [];
  const commissions: AdminCommission[] = [];
  let n = 0;

  const pushReferral = (
    affId: string,
    shop: string,
    username: string,
    status: ReferralStatus,
    signedAgo: number,
    opts: Partial<AdminReferral> = {},
  ): AdminReferral => {
    n += 1;
    const aff = byId(affId);
    const email = `${username.replace(/[^a-z0-9]/g, '')}@${['gmail.com', 'outlook.com', 'proton.me', 'icloud.com'][n % 4]}`;
    const [first, ...rest] = email.split('@');
    const r: AdminReferral = {
      id: `ref_${String(n).padStart(3, '0')}`,
      affiliateId: affId,
      affiliateName: aff.name,
      affiliateHandle: aff.primaryCode,
      shopName: shop,
      sellerUsername: username,
      sellerEmail: email,
      maskedEmail: `${first[0]}***@${rest.join('@')}`,
      codeUsed: aff.primaryCode,
      status,
      flagReason: null,
      signedUpAt: iso(signedAgo),
      verifiedAt: status === 'pending_verification' ? null : iso(signedAgo),
      trialEndsAt: isoAhead(30 - signedAgo),
      paidAt: null,
      payDeadlineAt: isoAhead(settings.payDeadlineDays - signedAgo),
      paidPlan: null,
      commission: null,
      ...opts,
    };
    referrals.push(r);
    return r;
  };

  const pushPaid = (
    affId: string,
    shop: string,
    username: string,
    plan: 'monthly' | 'yearly',
    cStatus: CommissionStatus,
    createdAgo: number,
    extra: Partial<AdminCommission> = {},
  ) => {
    const aff = byId(affId);
    const ref = pushReferral(affId, shop, username, 'paid', createdAgo + 14, {
      paidAt: iso(createdAgo),
      paidPlan: plan,
    });
    const amount = Math.round((PLAN[plan].cents * settings.rateBps) / 10_000);
    const c: AdminCommission = {
      id: `comm_${String(commissions.length + 1).padStart(3, '0')}`,
      referralId: ref.id,
      affiliateId: affId,
      affiliateName: aff.name,
      affiliateHandle: aff.primaryCode,
      shopName: shop,
      planName: PLAN[plan].name,
      baseAmountCents: PLAN[plan].cents,
      rateBps: settings.rateBps,
      amountCents: amount,
      status: cStatus,
      holdUntil: new Date(new Date(ref.paidAt!).getTime() + settings.holdPeriodDays * DAY).toISOString(),
      approvedAt: cStatus === 'approved' || cStatus === 'paid' ? iso(Math.max(createdAgo - settings.holdPeriodDays, 1)) : null,
      createdAt: iso(createdAgo),
      payoutId: null,
      reversedAt: null,
      reversalReason: null,
      payoutBatchId: null,
      ...extra,
    };
    commissions.push(c);
    ref.commission = { id: c.id, amountCents: c.amountCents, status: c.status };
  };

  // Ahmad: top performer, eligible for payout (approved $60)
  pushPaid('aff_ahmad_02', 'Lahore Leather Works', 'lahoreleather', 'yearly', 'paid', 75, { payoutBatchId: 'BATCH_2026_09' });
  for (let i = 0; i < 6; i++) {
    pushPaid('aff_ahmad_02', ['Karakoram Crafts', 'Indus Spice Co', 'Zari Threads', 'Mehr Ceramics', 'Chai Chowk', 'Nur Bookshop'][i], ['karakoram', 'indusspice', 'zarithreads', 'mehrceramics', 'chaichowk', 'nurbooks'][i], 'yearly', 'approved', 42 - i * 2);
  }
  pushPaid('aff_ahmad_02', 'Bazaar Bloom', 'bazaarbloom', 'monthly', 'pending', 12);
  pushReferral('aff_ahmad_02', 'Sufi Candles', 'sufic', 'trial', 9);
  pushReferral('aff_ahmad_02', 'Peshawari Nuts', 'pnuts', 'verified', 2);

  // Sarah
  pushPaid('aff_sarah_01', 'Artisan Bloom Studio', 'artisanbloom', 'monthly', 'paid', 70, { payoutBatchId: 'BATCH_2026_09' });
  pushPaid('aff_sarah_01', 'Urban Coffee Roasters', 'urbancoffee', 'yearly', 'approved', 40);
  pushPaid('aff_sarah_01', 'Komorebi Paper Goods', 'komorebi', 'yearly', 'approved', 36);
  pushPaid('aff_sarah_01', 'Saffron Silk Boutique', 'saffronsilk', 'monthly', 'reversed', 30, {
    reversedAt: iso(6),
    reversalReason: 'Payment refunded by administrative approval.',
  });
  pushPaid('aff_sarah_01', 'Terra Ceramics', 'terraceramics', 'monthly', 'pending', 8);
  pushReferral('aff_sarah_01', 'Nordic Minimal Living', 'nordicminimal', 'trial', 14);
  pushReferral('aff_sarah_01', 'Velvet Moon Apothecary', 'velvetmoon', 'trial', 8);
  pushReferral('aff_sarah_01', 'Coastal Crafted Jewels', 'coastaljewels', 'pending_verification', 1);
  pushReferral('aff_sarah_01', 'Solstice Botanical Tea', 'solsticetea', 'churned', 95);

  // Lina: exactly at threshold ($50)
  for (let i = 0; i < 5; i++) {
    pushPaid('aff_lina_03', ['Atelier Lune', 'Maison Fleur', 'Petit Pain', 'Soie & Sel', 'Rue des Livres'][i], ['atelierlune', 'maisonfleur', 'petitpain', 'soiesel', 'ruelivres'][i], 'yearly', 'approved', 55 - i * 3);
  }
  pushReferral('aff_lina_03', 'Lavande Home', 'lavandehome', 'trial', 5);

  // Omar: wise, $70 approved
  for (let i = 0; i < 7; i++) {
    pushPaid('aff_omar_04', ['Souk Textiles', 'Dune Oud', 'Palm & Pearl', 'Tahini Lab', 'Oasis Rugs', 'Falcon Gear', 'Majlis Home'][i], ['souktex', 'duneoud', 'palmpearl', 'tahinilab', 'oasisrugs', 'falcongear', 'majlishome'][i], 'yearly', 'approved', 60 - i * 3);
  }
  pushPaid('aff_omar_04', 'Kohl & Co', 'kohlco', 'yearly', 'paid', 80, { payoutBatchId: 'BATCH_2026_09' });
  pushReferral('aff_omar_04', 'Date Palm Treats', 'datepalm', 'trial', 11);

  // Priya: below threshold ($35)
  pushPaid('aff_priya_05', 'Masala Box', 'masalabox', 'yearly', 'approved', 48);
  pushPaid('aff_priya_05', 'Jaipur Prints', 'jaipurprints', 'yearly', 'approved', 44);
  pushPaid('aff_priya_05', 'Chai Leaf', 'chaileaf', 'yearly', 'approved', 41);
  pushPaid('aff_priya_05', 'Saree Stories', 'sareestories', 'monthly', 'approved', 39);
  pushPaid('aff_priya_05', 'Kolam Studio', 'kolamstudio', 'monthly', 'approved', 38);
  pushPaid('aff_priya_05', 'Neem & Co', 'neemco', 'monthly', 'pending', 6);
  pushReferral('aff_priya_05', 'Bindi Bazaar', 'bindibazaar', 'trial', 3);

  // Diego: suspended
  pushPaid('aff_diego_06', 'Casa Agave', 'casaagave', 'yearly', 'reversed', 25, {
    reversedAt: iso(9),
    reversalReason: 'Affiliate suspended: self-referral.',
  });
  pushReferral('aff_diego_06', 'Taco Tienda', 'tacotienda', 'rejected', 18, {
    flagReason: 'Self-referral detected: seller shares device fingerprint with affiliate.',
  });

  // Mei
  pushPaid('aff_mei_07', 'Matcha Mori', 'matchamori', 'yearly', 'pending', 14);
  pushReferral('aff_mei_07', 'Origami Atelier', 'origamiatelier', 'trial', 7);

  // Noah: balance but no payout method
  for (let i = 0; i < 5; i++) {
    pushPaid('aff_noah_08', ['Brezel Box', 'Hansa Tools', 'Rhein Wines', 'Lederwerk', 'Berlin Beans'][i], ['brezelbox', 'hansatools', 'rheinwines', 'lederwerk', 'berlinbeans'][i], 'yearly', 'approved', 40 - i * 2);
  }
  pushReferral('aff_noah_08', 'Schwarzwald Honig', 'swhonig', 'verified', 1);

  // ---- Flagged review queue ----
  const apex = pushReferral('aff_sarah_01', 'Apex Gaming Accessories', 'apexgaming', 'rejected', 20, {
    flagReason: 'Self-referral detected: common IP and payout device footprint.',
    paidAt: iso(6),
    paidPlan: 'yearly',
  });
  pushReferral('aff_priya_05', 'Throwaway Tees', 'throwawaytees', 'trial', 4, {
    flagReason: 'Disposable email domain used at signup.',
  });
  pushReferral('aff_ahmad_02', 'Velocity Vapes', 'velocityvapes', 'verified', 3, {
    flagReason: 'Seller IP matches 3 other signups from the same affiliate within 24h.',
  });
  pushReferral('aff_omar_04', 'Pixel Perfect Prints', 'pixelprints', 'rejected', 28, {
    flagReason: 'Referral code applied after trial start (attribution tampering suspected).',
  });
  void apex;

  // ---- Payout batch history ----
  const paidByAff = (id: string) => commissions.filter((c) => c.affiliateId === id && c.payoutBatchId === 'BATCH_2026_09');
  const batchItems: PayoutBatchItem[] = ['aff_sarah_01', 'aff_omar_04', 'aff_ahmad_02']
    .map((id) => {
      const a = byId(id);
      const list = paidByAff(id);
      return {
        affiliateId: id,
        affiliateName: a.name,
        affiliateEmail: a.email,
        method: a.payoutMethod!.type,
        destination: a.payoutMethod!.destination,
        last4: a.payoutMethod!.last4,
        amountCents: list.reduce((s, c) => s + c.amountCents, 0),
        commissionIds: list.map((c) => c.id),
      };
    })
    .filter((i) => i.commissionIds.length);
  const batches: PayoutBatch[] = [
    {
      id: 'BATCH_2026_09',
      label: 'September 2026',
      status: 'paid',
      createdAt: iso(24),
      paidAt: iso(21),
      reference: 'ACH-STL-98234',
      totalCents: batchItems.reduce((s, i) => s + i.amountCents, 0),
      items: batchItems,
    },
  ];
  commissions.forEach((c) => {
    if (c.payoutBatchId) c.payoutId = `pay_${c.payoutBatchId}_${c.affiliateId}`;
  });

  return { affiliates, referrals, commissions, batches, settings };
}

// ----------------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------------

function load(): State {
  if (typeof window === 'undefined') return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      setCustomReservedSlugs(parsed.settings.customReservedWords ?? []);
      return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  const fresh = seed();
  save(fresh);
  setCustomReservedSlugs(fresh.settings.customReservedWords ?? []);
  return fresh;
}

function save(state: State): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors in mock mode */
  }
}

// ----------------------------------------------------------------------------
// Derived views
// ----------------------------------------------------------------------------

function withMetrics(state: State, a: StoredAffiliate): AdminAffiliate {
  const refs = state.referrals.filter((r) => r.affiliateId === a.id);
  const comms = state.commissions.filter((c) => c.affiliateId === a.id);
  const sum = (s: CommissionStatus) => comms.filter((c) => c.status === s).reduce((t, c) => t + c.amountCents, 0);
  const { clicks, ...rest } = a;
  return {
    ...rest,
    metrics: {
      clicks,
      referrals: refs.length,
      trials: refs.filter((r) => r.status === 'trial').length,
      paid: refs.filter((r) => r.status === 'paid').length,
      flagged: refs.filter((r) => r.status === 'rejected' || r.flagReason).length,
      pendingCents: sum('pending'),
      approvedCents: sum('approved'),
      paidCents: sum('paid'),
      reversedCents: sum('reversed'),
    },
  };
}

function page<T>(list: T[], p: number, limit: number): T[] {
  return list.slice((p - 1) * limit, p * limit);
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function syncRefCommission(state: State, referralId: string): void {
  const ref = state.referrals.find((r) => r.id === referralId);
  if (!ref) return;
  const c = state.commissions.find((x) => x.referralId === referralId);
  ref.commission = c ? { id: c.id, amountCents: c.amountCents, status: c.status } : null;
}

function reverseCommission(c: AdminCommission, reason: string): void {
  c.status = 'reversed';
  c.reversedAt = new Date().toISOString();
  c.reversalReason = reason;
}

// ----------------------------------------------------------------------------
// Public engine
// ----------------------------------------------------------------------------

class AdminAffiliateMockDatabase {
  private state: State | null = null;

  private get s(): State {
    if (!this.state) this.state = load();
    return this.state;
  }

  private commit(): void {
    if (this.state) save(this.state);
  }

  reset(): void {
    this.state = seed();
    this.commit();
  }

  // ---- Affiliates ---------------------------------------------------------

  listAffiliates(q: string, status: string, p: number, limit: number) {
    const s = this.s;
    const needle = q.trim().toLowerCase();
    let list = s.affiliates.map((a) => withMetrics(s, a));
    const all = list;
    if (status === 'active' || status === 'suspended') list = list.filter((a) => a.status === status);
    if (needle) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(needle) ||
          a.email.toLowerCase().includes(needle) ||
          a.primaryCode.includes(needle) ||
          (a.aliasCodes ?? []).some((c) => c.includes(needle)),
      );
    }
    list.sort((a, b) => b.metrics.approvedCents + b.metrics.paidCents - (a.metrics.approvedCents + a.metrics.paidCents));
    return {
      affiliates: page(list, p, limit),
      total: list.length,
      summary: {
        totalAffiliates: all.length,
        activeAffiliates: all.filter((a) => a.status === 'active').length,
        suspendedAffiliates: all.filter((a) => a.status === 'suspended').length,
        totalReferrals: all.reduce((t, a) => t + a.metrics.referrals, 0),
        paidReferrals: all.reduce((t, a) => t + a.metrics.paid, 0),
        liabilityCents: all.reduce((t, a) => t + a.metrics.pendingCents + a.metrics.approvedCents, 0),
        paidOutCents: all.reduce((t, a) => t + a.metrics.paidCents, 0),
      },
    };
  }

  getAffiliate(id: string) {
    const s = this.s;
    const a = s.affiliates.find((x) => x.id === id);
    if (!a) throw new Error('Affiliate not found');
    return {
      affiliate: withMetrics(s, a),
      referrals: s.referrals.filter((r) => r.affiliateId === id).sort((x, y) => +new Date(y.signedUpAt) - +new Date(x.signedUpAt)),
      commissions: s.commissions.filter((c) => c.affiliateId === id).sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)),
      batches: s.batches.filter((b) => b.items.some((i) => i.affiliateId === id)),
      settings: s.settings,
    };
  }

  setAffiliateStatus(id: string, status: 'active' | 'suspended', reason?: string) {
    const s = this.s;
    const a = s.affiliates.find((x) => x.id === id);
    if (!a) throw new Error('Affiliate not found');
    a.status = status;
    if (status === 'suspended') {
      a.suspendedAt = new Date().toISOString();
      a.suspendedReason = reason?.trim() || 'Suspended by administrator.';
      // Pending commissions are frozen by reversal so a suspended partner cannot accrue payable balance.
      s.commissions
        .filter((c) => c.affiliateId === id && c.status === 'pending')
        .forEach((c) => {
          reverseCommission(c, 'Affiliate suspended by administrator.');
          syncRefCommission(s, c.referralId);
        });
    } else {
      a.suspendedAt = null;
      a.suspendedReason = null;
    }
    this.commit();
    return withMetrics(s, a);
  }

  // ---- Referrals ----------------------------------------------------------

  listReferrals(q: string, view: string, p: number, limit: number) {
    const s = this.s;
    const needle = q.trim().toLowerCase();
    const flaggedPredicate = (r: AdminReferral) => r.status === 'rejected' || !!r.flagReason;
    let list = [...s.referrals];
    const flagged = list.filter(flaggedPredicate);
    if (view === 'flagged') list = flagged;
    else if (view !== 'all') list = list.filter((r) => r.status === view);
    if (needle) {
      list = list.filter(
        (r) =>
          r.shopName.toLowerCase().includes(needle) ||
          r.sellerEmail.toLowerCase().includes(needle) ||
          r.sellerUsername.toLowerCase().includes(needle) ||
          r.affiliateName.toLowerCase().includes(needle) ||
          r.affiliateHandle.includes(needle),
      );
    }
    list.sort((a, b) => +new Date(b.signedUpAt) - +new Date(a.signedUpAt));
    return {
      referrals: page(list, p, limit),
      total: list.length,
      summary: {
        total: s.referrals.length,
        flagged: flagged.length,
        rejected: s.referrals.filter((r) => r.status === 'rejected').length,
        trials: s.referrals.filter((r) => r.status === 'trial').length,
        paid: s.referrals.filter((r) => r.status === 'paid').length,
      },
    };
  }

  reviewReferral(id: string, action: ReferralReviewAction, payload: { note?: string; affiliateId?: string }) {
    const s = this.s;
    const ref = s.referrals.find((r) => r.id === id);
    if (!ref) throw new Error('Referral not found');
    const now = new Date();
    const linked = s.commissions.find((c) => c.referralId === ref.id);
    const note = payload.note?.trim() || null;

    const restoredStatus = (): ReferralStatus => {
      if (ref.paidAt) return 'paid';
      if (new Date(ref.trialEndsAt) > now) return ref.verifiedAt ? 'trial' : 'pending_verification';
      return 'churned';
    };

    if (action === 'reject') {
      if (!note) throw new Error('A rejection reason is required.');
      ref.status = 'rejected';
      ref.flagReason = note;
      if (linked && (linked.status === 'pending' || linked.status === 'approved')) {
        reverseCommission(linked, 'Referral rejected by administrator.');
      }
    } else if (action === 'approve') {
      ref.flagReason = null;
      if (ref.status === 'rejected') ref.status = restoredStatus();
      const affiliate = s.affiliates.find((a) => a.id === ref.affiliateId);
      const deadline = new Date(ref.payDeadlineAt);
      // Generate a commission when the seller already paid inside the window and none exists yet.
      if (ref.paidAt && !linked && affiliate?.status === 'active' && new Date(ref.paidAt) <= deadline) {
        const plan = ref.paidPlan ?? 'yearly';
        const amount = Math.round((PLAN[plan].cents * s.settings.rateBps) / 10_000);
        const holdUntil = new Date(new Date(ref.paidAt).getTime() + s.settings.holdPeriodDays * DAY);
        s.commissions.push({
          id: `comm_${String(s.commissions.length + 1).padStart(3, '0')}_${Date.now().toString(36)}`,
          referralId: ref.id,
          affiliateId: ref.affiliateId,
          affiliateName: ref.affiliateName,
          affiliateHandle: ref.affiliateHandle,
          shopName: ref.shopName,
          planName: PLAN[plan].name,
          baseAmountCents: PLAN[plan].cents,
          rateBps: s.settings.rateBps,
          amountCents: amount,
          status: holdUntil <= now ? 'approved' : 'pending',
          holdUntil: holdUntil.toISOString(),
          approvedAt: holdUntil <= now ? now.toISOString() : null,
          createdAt: now.toISOString(),
          payoutId: null,
          payoutBatchId: null,
        });
      } else if (linked?.status === 'reversed' && linked.reversalReason?.startsWith('Referral rejected')) {
        // Restore commission previously reversed by a rejection.
        linked.status = new Date(linked.holdUntil) <= now ? 'approved' : 'pending';
        linked.reversedAt = null;
        linked.reversalReason = null;
      }
    } else {
      const target = s.affiliates.find((a) => a.id === payload.affiliateId);
      if (!target) throw new Error('Select an affiliate to reassign to.');
      if (target.status !== 'active') throw new Error('Cannot reassign to a suspended affiliate.');
      if (target.id === ref.affiliateId) throw new Error('Referral already belongs to this affiliate.');
      ref.affiliateId = target.id;
      ref.affiliateName = target.name;
      ref.affiliateHandle = target.primaryCode;
      ref.codeUsed = target.primaryCode;
      ref.flagReason = null;
      if (ref.status === 'rejected') ref.status = restoredStatus();
      if (linked && linked.status !== 'paid') {
        linked.affiliateId = target.id;
        linked.affiliateName = target.name;
        linked.affiliateHandle = target.primaryCode;
      }
    }

    ref.reviewNote = note;
    ref.reviewedAt = now.toISOString();
    syncRefCommission(s, ref.id);
    this.commit();
    return { referral: ref };
  }

  // ---- Commissions --------------------------------------------------------

  listCommissions(q: string, status: string, p: number, limit: number) {
    const s = this.s;
    const needle = q.trim().toLowerCase();
    let list = [...s.commissions];
    const sum = (st: CommissionStatus) => list.filter((c) => c.status === st).reduce((t, c) => t + c.amountCents, 0);
    const summary = {
      pendingCents: sum('pending'),
      approvedCents: sum('approved'),
      paidCents: sum('paid'),
      reversedCents: sum('reversed'),
      count: list.length,
    };
    if (status !== 'all') list = list.filter((c) => c.status === status);
    if (needle) {
      list = list.filter(
        (c) =>
          c.shopName.toLowerCase().includes(needle) ||
          c.affiliateName.toLowerCase().includes(needle) ||
          c.affiliateHandle.includes(needle) ||
          c.id.includes(needle),
      );
    }
    list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return { commissions: page(list, p, limit), total: list.length, summary };
  }

  reverseCommission(id: string, reason: string) {
    const s = this.s;
    const c = s.commissions.find((x) => x.id === id);
    if (!c) throw new Error('Commission not found');
    if (c.status === 'reversed') throw new Error('Commission is already reversed.');
    if (c.status === 'paid') throw new Error('Disbursed commissions cannot be reversed here. Record a clawback against the next batch.');
    if (c.payoutBatchId) throw new Error(`Locked: attached to open payout batch ${c.payoutBatchId}. Mark the batch as paid first.`);
    if (!reason.trim()) throw new Error('A reversal reason is required.');
    reverseCommission(c, reason.trim());
    syncRefCommission(s, c.referralId);
    this.commit();
    return { commission: c };
  }

  // ---- Payouts ------------------------------------------------------------

  getPayoutOverview() {
    const s = this.s;
    const attached = new Set(s.batches.filter((b) => b.status === 'processing').flatMap((b) => b.items.flatMap((i) => i.commissionIds)));
    const candidates: PayoutCandidate[] = s.affiliates
      .map((a) => {
        const comms = s.commissions.filter((c) => c.affiliateId === a.id && c.status === 'approved' && !attached.has(c.id));
        const approvedCents = comms.reduce((t, c) => t + c.amountCents, 0);
        let blockedReason: PayoutCandidate['blockedReason'] = null;
        if (a.status === 'suspended') blockedReason = 'suspended';
        else if (approvedCents < s.settings.minimumPayoutCents) blockedReason = 'below_threshold';
        else if (!a.payoutMethod) blockedReason = 'no_payout_method';
        return {
          affiliateId: a.id,
          affiliateName: a.name,
          affiliateEmail: a.email,
          affiliateHandle: a.primaryCode,
          method: a.payoutMethod?.type ?? null,
          last4: a.payoutMethod?.last4 ?? null,
          approvedCents,
          commissionCount: comms.length,
          eligible: !blockedReason,
          blockedReason,
        };
      })
      .filter((c) => c.approvedCents > 0)
      .sort((a, b) => b.approvedCents - a.approvedCents);
    return {
      candidates,
      batches: [...s.batches].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      settings: s.settings,
    };
  }

  generateBatch() {
    const s = this.s;
    const overview = this.getPayoutOverview();
    const eligible = overview.candidates.filter((c) => c.eligible);
    if (!eligible.length) throw new Error('No affiliates currently meet the minimum payout threshold.');
    const d = new Date();
    const base = `BATCH_${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = s.batches.filter((b) => b.id.startsWith(base)).length;
    const id = existing ? `${base}_${existing + 1}` : base;

    const items: PayoutBatchItem[] = eligible.map((c) => {
      const aff = s.affiliates.find((a) => a.id === c.affiliateId)!;
      const attachedIds = new Set(s.batches.filter((b) => b.status === 'processing').flatMap((b) => b.items.flatMap((i) => i.commissionIds)));
      const comms = s.commissions.filter((x) => x.affiliateId === aff.id && x.status === 'approved' && !attachedIds.has(x.id));
      comms.forEach((x) => {
        x.payoutBatchId = id;
        x.payoutId = `pay_${id}_${aff.id}`;
      });
      return {
        affiliateId: aff.id,
        affiliateName: aff.name,
        affiliateEmail: aff.email,
        method: aff.payoutMethod!.type,
        destination: aff.payoutMethod!.destination,
        last4: aff.payoutMethod!.last4,
        amountCents: comms.reduce((t, x) => t + x.amountCents, 0),
        commissionIds: comms.map((x) => x.id),
      };
    });

    const batch: PayoutBatch = {
      id,
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      status: 'processing',
      createdAt: d.toISOString(),
      paidAt: null,
      reference: null,
      totalCents: items.reduce((t, i) => t + i.amountCents, 0),
      items,
    };
    s.batches.unshift(batch);
    this.commit();
    return { batch };
  }

  markBatchPaid(id: string, reference: string) {
    const s = this.s;
    const batch = s.batches.find((b) => b.id === id);
    if (!batch) throw new Error('Batch not found');
    if (batch.status === 'paid') throw new Error('Batch is already marked as paid.');
    const ref = reference.trim();
    if (ref.length < 4) throw new Error('Enter the bank / PayPal transaction reference (min 4 characters).');
    const now = new Date().toISOString();
    const ids = new Set(batch.items.flatMap((i) => i.commissionIds));
    s.commissions.forEach((c) => {
      // Skip any commission reversed after the batch was built.
      if (ids.has(c.id) && c.status === 'approved') {
        c.status = 'paid';
        syncRefCommission(s, c.referralId);
      }
    });
    batch.status = 'paid';
    batch.paidAt = now;
    batch.reference = ref;
    this.commit();
    return { batch };
  }

  // ---- Settings -----------------------------------------------------------

  getSettings(): AffiliateProgramSettings {
    return this.s.settings;
  }

  updateSettings(next: AffiliateProgramSettings): AffiliateProgramSettings {
    if (next.rateBps < 100 || next.rateBps > 5000) throw new Error('Commission rate must be between 1% and 50%.');
    if (next.holdPeriodDays < 0 || next.holdPeriodDays > 180) throw new Error('Hold period must be between 0 and 180 days.');
    if (next.payDeadlineDays < 7 || next.payDeadlineDays > 365) throw new Error('Qualification deadline must be between 7 and 365 days.');
    if (next.minimumPayoutCents < 500 || next.minimumPayoutCents > 1_000_000) throw new Error('Minimum payout must be between $5.00 and $10,000.00.');
    this.s.settings = { ...next, customReservedWords: [...new Set(next.customReservedWords ?? [])] };
    setCustomReservedSlugs(this.s.settings.customReservedWords ?? []);
    this.commit();
    return this.s.settings;
  }

  // ---- Subscription hooks -------------------------------------------------

  /**
   * Resolve referral attribution for sellers shown in AdminSubscriptions.
   * Real referrals matched by username win. In mock mode, sellers from the real
   * subscriptions endpoint are not part of the seeded dataset, so a deterministic
   * ~1/3 of unmatched sellers are attributed to seeded affiliates, letting the
   * chips and modal notices be exercised end to end.
   */
  resolveAttribution(sellers: { id: string; username: string }[]): Record<string, SubscriptionReferralAttribution> {
    const s = this.s;
    const active = s.affiliates.filter((a) => a.status === 'active');
    const out: Record<string, SubscriptionReferralAttribution> = {};
    sellers.forEach(({ id, username }) => {
      const ref = s.referrals.find((r) => r.sellerUsername === username && r.status !== 'rejected');
      if (ref) {
        const a = s.affiliates.find((x) => x.id === ref.affiliateId)!;
        out[id] = {
          referralId: ref.id,
          affiliateId: a.id,
          handle: a.primaryCode,
          name: a.name,
          rateBps: s.settings.rateBps,
          affiliateActive: a.status === 'active',
          payDeadlineAt: ref.payDeadlineAt,
          commissionIssued: !!ref.commission,
        };
        return;
      }
      const h = hash(id + username);
      if (h % 3 === 0 && active.length) {
        const a = active[h % active.length];
        out[id] = {
          referralId: `ref_mock_${id}`,
          affiliateId: a.id,
          handle: a.primaryCode,
          name: a.name,
          rateBps: s.settings.rateBps,
          affiliateActive: true,
          payDeadlineAt: isoAhead(s.settings.payDeadlineDays - (h % 40)),
          commissionIssued: false,
        };
      }
    });
    return out;
  }
}

export const adminAffiliateDb = new AdminAffiliateMockDatabase();
