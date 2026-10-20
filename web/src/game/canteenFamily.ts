import { Container, Graphics, Text } from "pixi.js";
import { t } from "../i18n";

export type FamilyRole = "boss" | "wife" | "eldestDaughter" | "youngerDaughter" | "son";

/**
 * Canteen Family NPCs:
 * - Boss (Father)
 * - Wife (Mother)
 * - Eldest Daughter (Studious prompt master)
 * - Younger Daughter (Energetic drink courier)
 * - Son (Warehouse cargo lifter)
 */
export class CanteenFamily {
  readonly container = new Container();

  // Individual character containers
  readonly bossG = new Container();
  readonly wifeG = new Container();
  readonly eldestG = new Container();
  readonly youngerG = new Container();
  readonly sonG = new Container();

  private readonly bubble = new Graphics();
  private bubbleText: Text | null = null;
  private bubbleTimer = 0;

  // Animation states
  private animTimer = 0;
  private youngerX = 440;
  private youngerY = 135;
  private youngerTargetX = 350;
  private youngerTargetY = 140;
  private youngerDir = -1;

  private sonX = 495;
  private sonY = 250;
  private sonState: "walk" | "lift" | "stack" | "rest" = "lift";
  private sonTimer = 0;
  private sonHoldingBox = true;

  onMemberClick?: (role: FamilyRole) => void;

  constructor() {
    this.container.addChild(
      this.bossG,
      this.wifeG,
      this.eldestG,
      this.youngerG,
      this.sonG,
      this.bubble,
    );

    this.setupInteractivity();
    this.renderBoss(0);
    this.renderWife(0);
    this.renderEldest(0);
    this.renderYounger(0);
    this.renderSon(0);
  }

  private setupInteractivity(): void {
    const attach = (cont: Container, role: FamilyRole, width: number, height: number) => {
      cont.eventMode = "static";
      cont.cursor = "pointer";
      cont.hitArea = { contains: (x: number, y: number) => x >= -width / 2 && x <= width / 2 && y >= -height && y <= 0 };
      let pid = -1;
      cont.on("pointerdown", (e) => { pid = e.pointerId; });
      cont.on("pointerup", (e) => {
        if (e.pointerId === pid) {
          pid = -1;
          this.handleRoleClick(role);
        }
      });
    };

    attach(this.bossG, "boss", 16, 24);
    attach(this.wifeG, "wife", 16, 24);
    attach(this.eldestG, "eldestDaughter", 14, 22);
    attach(this.youngerG, "youngerDaughter", 14, 20);
    attach(this.sonG, "son", 16, 26);

    // Initial positions
    this.bossG.position.set(480, 88);
    this.wifeG.position.set(516, 88);
    this.eldestG.position.set(462, 126);
    this.youngerG.position.set(this.youngerX, this.youngerY);
    this.sonG.position.set(this.sonX, this.sonY);
  }

  showBubble(x: number, y: number, message: string): void {
    this.bubble.clear();
    if (!this.bubbleText) {
      this.bubbleText = new Text({
        text: message,
        style: {
          fontFamily: "'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
          fontSize: 6.5,
          fontWeight: "bold",
          fill: 0x1e293b,
        },
        resolution: 6,
      });
      this.bubbleText.anchor.set(0.5, 1);
      this.bubble.addChild(this.bubbleText);
    } else {
      this.bubbleText.text = message;
    }

    const pad = 4;
    const w = Math.max(30, this.bubbleText.width + pad * 2);
    const h = 12;

    this.bubble.rect(x - w / 2, y - h - 4, w, h).fill(0xffffff);
    this.bubble.rect(x - w / 2, y - h - 4, w, h).stroke({ width: 1, color: 0x334155 });
    // speech pointer triangle
    this.bubble.poly([x - 2, y - 4, x + 2, y - 4, x, y - 1]).fill(0xffffff);

    this.bubbleText.position.set(x, y - 4.5);
    this.bubble.visible = true;
    this.bubbleTimer = 3500;
  }

  private handleRoleClick(role: FamilyRole): void {
    switch (role) {
      case "boss":
        this.showBubble(this.bossG.x, this.bossG.y - 25, t("來一杯熱黑咖啡提神嗎？為你打氣！"));
        break;
      case "wife":
        this.showBubble(this.wifeG.x, this.wifeG.y - 25, t("今日 Token 與專案進度，帳本記得很清楚喔！"));
        break;
      case "eldestDaughter":
        this.showBubble(this.eldestG.x, this.eldestG.y - 23, t("這是我整理的 Prompt 範本，隨時參考！"));
        break;
      case "youngerDaughter":
        this.showBubble(this.youngerG.x, this.youngerG.y - 22, t("點心外送～！黑貓也吃飽了喵！"));
        break;
      case "son":
        this.showBubble(this.sonG.x, this.sonG.y - 27, t("呼～貨物堆疊完畢！隨時為你清倉！"));
        break;
    }
    this.onMemberClick?.(role);
  }

  // Pixel sprite renderers
  private renderBoss(phase: number): void {
    const g = new Graphics();
    this.bossG.removeChildren();
    this.bossG.addChild(g);

    const bob = Math.sin(phase * 4) * 0.8;

    // Hair & Head
    g.rect(-5, -23 + bob, 10, 5).fill(0x3f3f46); // dark brown hair
    g.rect(-5, -21 + bob, 10, 8).fill(0xfbcfe8); // skin
    g.rect(-3, -19 + bob, 2, 2).fill(0x18181b); // eyes
    g.rect(1, -19 + bob, 2, 2).fill(0x18181b);
    g.rect(-3, -15 + bob, 6, 2).fill(0x52525b); // friendly mustache

    // Body & White apron
    g.rect(-6, -13 + bob, 12, 10).fill(0x1e3a8a); // navy shirt
    g.rect(-4, -13 + bob, 8, 12).fill(0xffffff);  // white apron
    g.rect(-3, -11 + bob, 6, 2).fill(0xef4444);  // red tie / neckerchief

    // Hands wiping or holding mug
    g.rect(-7, -8 + bob, 3, 3).fill(0xfbcfe8);
    g.rect(4, -8 + bob, 4, 4).fill(0xd97706);    // coffee mug
    g.rect(5, -6 + bob, 2, 1).fill(0xffedd5);    // latte foam
  }

  private renderWife(phase: number): void {
    const g = new Graphics();
    this.wifeG.removeChildren();
    this.wifeG.addChild(g);

    const bob = Math.sin(phase * 4 + 1) * 0.8;

    // Hair bun & Head
    g.circle(0, -25 + bob, 3.5).fill(0x78350f);  // hair bun
    g.rect(-5, -22 + bob, 10, 7).fill(0x78350f); // hair
    g.rect(-4, -20 + bob, 8, 8).fill(0xfbcfe8);  // face
    g.rect(-4, -18 + bob, 8, 2).fill(0xd97706);  // stylish glasses
    g.rect(-3, -18 + bob, 2, 1).fill(0x18181b);  // eyes
    g.rect(1, -18 + bob, 2, 1).fill(0x18181b);
    g.rect(-1, -15 + bob, 2, 1).fill(0xe11d48);  // smile

    // Cardigan & Floral Apron
    g.rect(-5, -12 + bob, 10, 10).fill(0xf472b6); // pink cardigan
    g.rect(-3, -12 + bob, 6, 12).fill(0xfef08a);  // yellow apron
    // Ledger notebook in hand
    g.rect(-6, -9 + bob, 6, 8).fill(0x1e293b);   // ledger cover
    g.rect(-5, -8 + bob, 4, 6).fill(0xffffff);   // white pages
  }

  private renderEldest(phase: number): void {
    const g = new Graphics();
    this.eldestG.removeChildren();
    this.eldestG.addChild(g);

    const bob = Math.sin(phase * 3.5) * 0.7;

    // Studious daughter with bob cut & glasses
    g.rect(-4.5, -21 + bob, 9, 8).fill(0x292524); // neat dark bob
    g.rect(-4, -18 + bob, 8, 7).fill(0xfde047);  // skin
    g.rect(-3.5, -17 + bob, 7, 2).fill(0x0284c7);// blue glasses
    g.rect(-2.5, -17 + bob, 2, 1).fill(0x0f172a);
    g.rect(0.5, -17 + bob, 2, 1).fill(0x0f172a);

    // Knit sweater
    g.rect(-4.5, -11 + bob, 9, 9).fill(0x059669); // emerald green sweater
    g.rect(-4, -2 + bob, 8, 3).fill(0x1e293b);   // skirt

    // Holding binder/tablet
    g.rect(-2, -8 + bob, 5, 6).fill(0x38bdf8);   // digital tablet screen
    g.rect(-1, -7 + bob, 3, 4).fill(0xffffff);
  }

  private renderYounger(phase: number): void {
    const g = new Graphics();
    this.youngerG.removeChildren();
    this.youngerG.addChild(g);

    const hop = Math.abs(Math.sin(phase * 8)) * 1.8;

    // Twin pigtails
    g.rect(-6, -19 - hop, 2, 5).fill(0xb45309);  // left pigtail
    g.rect(4, -19 - hop, 2, 5).fill(0xb45309);   // right pigtail
    g.rect(-4, -20 - hop, 8, 7).fill(0xb45309);  // hair
    g.rect(-3.5, -17 - hop, 7, 6).fill(0xfde047);// cute face
    g.rect(-2.5, -16 - hop, 1.5, 1.5).fill(0x18181b); // sparkly eyes
    g.rect(1, -16 - hop, 1.5, 1.5).fill(0x18181b);
    g.rect(-1, -13 - hop, 2, 1).fill(0xf43f5e);  // happy mouth

    // Yellow hoodie & shorts
    g.rect(-4, -11 - hop, 8, 7).fill(0xfacc15);  // bright yellow hoodie
    g.rect(-3.5, -4 - hop, 7, 3).fill(0x2563eb); // blue denim shorts
    g.rect(-3, -1 - hop, 2, 2).fill(0xffffff);   // white sneakers
    g.rect(1, -1 - hop, 2, 2).fill(0xffffff);

    // Serving tray with drinks
    g.rect(-5 * this.youngerDir, -8 - hop, 8, 2).fill(0x94a3b8); // tray
    g.rect(-4 * this.youngerDir, -11 - hop, 2, 3).fill(0xd97706); // juice cup
    g.rect(-1 * this.youngerDir, -11 - hop, 2, 3).fill(0xef4444); // cola can
  }

  private renderSon(phase: number): void {
    const g = new Graphics();
    this.sonG.removeChildren();
    this.sonG.addChild(g);

    const bob = Math.sin(phase * 5) * 0.9;

    // Backwards baseball cap
    g.rect(-5, -24 + bob, 10, 4).fill(0xef4444);  // red cap
    g.rect(4, -22 + bob, 3, 2).fill(0xb91c1c);   // backwards cap brim
    g.rect(-4.5, -20 + bob, 9, 7).fill(0xfcd34d);// energetic tanned skin
    g.rect(-3, -18 + bob, 2, 1.5).fill(0x18181b);
    g.rect(1, -18 + bob, 2, 1.5).fill(0x18181b);
    g.rect(-2, -15 + bob, 4, 1.5).fill(0x78350f);// cheerful smile

    // Muscle shirt & denim overalls
    g.rect(-5, -13 + bob, 10, 11).fill(0x1e40af); // blue denim overalls
    g.rect(-3, -13 + bob, 6, 8).fill(0x3b82f6);
    g.rect(-5, -2 + bob, 4, 3).fill(0x78350f);  // work boots
    g.rect(1, -2 + bob, 4, 3).fill(0x78350f);

    // Yellow work gloves holding a cargo box
    if (this.sonHoldingBox) {
      g.rect(-6, -11 + bob, 12, 10).fill(0xb45309); // cardboard box
      g.rect(-5, -10 + bob, 10, 8).fill(0xd97706);
      g.rect(-1, -11 + bob, 2, 10).fill(0x92400e);  // tape
      g.rect(-7, -9 + bob, 2, 3).fill(0xfacc15);    // yellow gloves
      g.rect(5, -9 + bob, 2, 3).fill(0xfacc15);
    } else {
      // Wiping sweat
      g.rect(-7, -15 + bob, 3, 3).fill(0xfacc15);
      g.rect(4, -9 + bob, 2, 3).fill(0xfacc15);
    }
  }

  update(elapsed: number, dt: number): void {
    this.animTimer += dt * 0.001;

    // Re-render slight animation pulses
    this.renderBoss(this.animTimer);
    this.renderWife(this.animTimer);
    this.renderEldest(this.animTimer);
    this.renderYounger(this.animTimer);
    this.renderSon(this.animTimer);

    // Speech bubble auto fade
    if (this.bubbleTimer > 0) {
      this.bubbleTimer -= dt;
      if (this.bubbleTimer <= 0) {
        this.bubble.visible = false;
      }
    }

    // Younger daughter walking between canteen and office desks
    const ydx = this.youngerTargetX - this.youngerX;
    const ydy = this.youngerTargetY - this.youngerY;
    const ydist = Math.hypot(ydx, ydy);

    if (ydist > 2) {
      const speed = 0.03 * dt;
      this.youngerX += (ydx / ydist) * speed;
      this.youngerY += (ydy / ydist) * speed;
      this.youngerDir = ydx > 0 ? 1 : -1;
      this.youngerG.position.set(this.youngerX, this.youngerY);
    } else {
      // Pick next destination (between canteen counter and office floor)
      if (Math.random() < 0.02) {
        if (this.youngerTargetX < 400) {
          // Return to tuck shop
          this.youngerTargetX = 430 + Math.random() * 30;
          this.youngerTargetY = 125 + Math.random() * 20;
        } else {
          // Deliver tea to office
          this.youngerTargetX = 220 + Math.random() * 180;
          this.youngerTargetY = 130 + Math.random() * 100;
        }
      }
    }

    // Son warehouse cargo routine
    this.sonTimer += dt;
    if (this.sonTimer > 3500) {
      this.sonTimer = 0;
      this.sonHoldingBox = !this.sonHoldingBox;
    }
  }
}
