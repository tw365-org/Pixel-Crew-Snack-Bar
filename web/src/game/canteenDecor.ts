import { Container, Graphics, Text } from "pixi.js";

/**
 * Canteen & Warehouse Decor Layer
 * Adds pixel-art snack bar counter, drink fridge, snack shelves,
 * warm lighting, and warehouse cargo pallets / boxes to the right section (x: 448 ~ 576).
 */
export class CanteenDecor {
  readonly container = new Container();
  private readonly g = new Graphics();
  private readonly lightG = new Graphics();

  constructor() {
    this.container.addChild(this.lightG, this.g);
    this.render();
  }

  private render(): void {
    const g = this.g;
    const l = this.lightG;
    g.clear();
    l.clear();

    // 1. Threshold dividing wall & archway between Office and Canteen (x: 448)
    g.rect(448, 0, 4, 336).fill(0x131b30); // dark pillar
    g.rect(448, 50, 4, 2).fill(0x2a3a60);

    // Cute Archway Sign: "福利社 SNACK BAR"
    g.rect(456, 6, 80, 16).fill(0x2d1f14); // warm wood sign border
    g.rect(458, 8, 76, 12).fill(0xffcb52); // warm yellow sign board
    g.rect(460, 10, 72, 8).fill(0xd97706); // banner inner

    const signText = new Text({
      text: "福利社 · SNACK",
      style: {
        fontFamily: "'Courier New', monospace, sans-serif",
        fontSize: 7,
        fontWeight: "bold",
        fill: 0xfffbeb,
      },
      resolution: 4,
    });
    signText.position.set(463, 9.5);
    this.container.addChild(signText);

    // Warm pendant light hanging from ceiling (x: 495, y: 0)
    g.rect(495, 0, 1, 24).fill(0x52525b); // black wire
    g.rect(492, 24, 7, 3).fill(0xd97706); // lamp shade
    g.rect(494, 27, 3, 2).fill(0xfef08a); // light bulb

    // Warm glow on floor/counter
    l.circle(495, 45, 36).fill({ color: 0xfef08a, alpha: 0.08 });
    l.circle(495, 75, 55).fill({ color: 0xfde047, alpha: 0.05 });

    // 2. Wall Snack Shelves (x: 456, y: 26, w: 50, h: 22)
    g.rect(456, 26, 32, 22).fill(0x3f2d1d); // wood frame
    g.rect(458, 33, 28, 1).fill(0x78350f);  // shelf tier 1
    g.rect(458, 41, 28, 1).fill(0x78350f);  // shelf tier 2

    // Snacks on shelves (chips, cans, candy boxes)
    // Tier 1: chips bags
    g.rect(459, 29, 4, 4).fill(0xef4444); // red chips
    g.rect(464, 29, 4, 4).fill(0x3b82f6); // blue chips
    g.rect(469, 29, 4, 4).fill(0x10b981); // green chips
    g.rect(474, 29, 4, 4).fill(0xf59e0b); // cheese chips
    g.rect(479, 29, 4, 4).fill(0x8b5cf6); // grape candy

    // Tier 2: noodle cups / cans
    g.rect(460, 36, 3, 5).fill(0xf97316); // instant noodles 1
    g.rect(465, 36, 3, 5).fill(0xec4899); // instant noodles 2
    g.rect(470, 36, 3, 5).fill(0x06b6d4); // energy drink
    g.rect(475, 36, 3, 5).fill(0x84cc16); // green tea
    g.rect(480, 36, 3, 5).fill(0xeab308); // coffee can

    // 3. Double-door Glowing Beverage Fridge (x: 520, y: 24, w: 22, h: 36)
    g.rect(520, 24, 22, 36).fill(0x1e293b); // outer steel
    g.rect(522, 26, 18, 32).fill(0x0284c7); // cool blue glass
    g.rect(530, 26, 1, 32).fill(0x38bdf8);  // door seam
    // Beverage cans inside fridge
    for (let row = 0; row < 3; row++) {
      const fy = 30 + row * 9;
      g.rect(522, fy + 4, 18, 1).fill(0xbae6fd); // shelf wire
      g.rect(524, fy, 2, 4).fill(0xef4444);      // cola
      g.rect(527, fy, 2, 4).fill(0x22c55e);      // sprite
      g.rect(532, fy, 2, 4).fill(0xeab308);      // lemon tea
      g.rect(535, fy, 2, 4).fill(0xa855f7);      // grape soda
    }
    // Neon fridge glare
    g.rect(523, 27, 2, 14).fill({ color: 0xffffff, alpha: 0.35 });

    // 4. Main Wood Counter Bar (x: 456, y: 88, w: 86, h: 18)
    g.rect(456, 88, 86, 4).fill(0xa16207);  // polished counter top
    g.rect(456, 92, 86, 14).fill(0x451a03); // wood counter front
    // Wood panels
    for (let px = 466; px < 540; px += 10) {
      g.rect(px, 92, 1, 14).fill(0x290d02);
    }
    g.rect(456, 105, 86, 2).fill(0x1c0901); // baseboard

    // Counter equipment:
    // Coffee Machine (x: 462, y: 78, w: 10, h: 10)
    g.rect(462, 78, 10, 10).fill(0x334155);
    g.rect(463, 80, 8, 4).fill(0x0f172a);
    g.rect(466, 84, 2, 3).fill(0x94a3b8); // coffee spout
    g.rect(465, 86, 4, 2).fill(0xd97706); // coffee mug

    // Cash Register with screen (x: 524, y: 79, w: 12, h: 9)
    g.rect(524, 82, 12, 6).fill(0x475569);
    g.rect(525, 78, 6, 4).fill(0x10b981); // green glowing cash screen
    g.rect(531, 80, 4, 3).fill(0x94a3b8); // receipt printer

    // 5. Section Divider to Warehouse (y: 160)
    g.rect(450, 160, 96, 3).fill(0x0f172a); // dark beam
    // Hazard warning stripes
    for (let hx = 452; hx < 544; hx += 8) {
      g.rect(hx, 161, 4, 1).fill(0xfacc15); // yellow stripe
    }

    const warehouseSign = new Text({
      text: "備貨倉庫 WAREHOUSE",
      style: {
        fontFamily: "'Courier New', monospace, sans-serif",
        fontSize: 5.5,
        fontWeight: "bold",
        fill: 0x94a3b8,
      },
      resolution: 4,
    });
    warehouseSign.position.set(458, 166);
    this.container.addChild(warehouseSign);

    // 6. Warehouse Props (y: 175 ~ 320)
    // Industrial metal shelving on right wall (x: 526, y: 180, w: 18, h: 70)
    g.rect(526, 180, 18, 70).fill(0x334155);
    g.rect(528, 200, 14, 2).fill(0x475569);
    g.rect(528, 225, 14, 2).fill(0x475569);
    g.rect(528, 245, 14, 2).fill(0x475569);

    // Warehouse Wooden Pallets (x: 460 ~ 500, y: 260)
    this.drawPallet(g, 462, 270, 24, 6);
    this.drawPallet(g, 492, 270, 24, 6);

    // Cardboard boxes stacked on pallets
    this.drawBox(g, 464, 252, 12, 12, "01");
    this.drawBox(g, 474, 256, 10, 8, "02");
    this.drawBox(g, 467, 242, 11, 10, "FRAGILE");

    this.drawBox(g, 494, 250, 14, 14, "AGY");
    this.drawBox(g, 497, 238, 10, 12, "CREW");

    // Hand Truck / Push Cart (x: 460, y: 295)
    g.rect(460, 305, 18, 3).fill(0xd97706); // orange cart deck
    g.rect(460, 290, 2, 16).fill(0x52525b); // upright handle
    g.circle(464, 309, 2.5).fill(0x18181b); // front wheel
    g.circle(474, 309, 2.5).fill(0x18181b); // back wheel
    this.drawBox(g, 463, 295, 10, 10, "UP");
  }

  private drawPallet(g: Graphics, x: number, y: number, w: number, h: number): void {
    g.rect(x, y, w, 2).fill(0x92400e);
    g.rect(x + 2, y + 2, 3, h - 2).fill(0x78350f);
    g.rect(x + w / 2 - 1.5, y + 2, 3, h - 2).fill(0x78350f);
    g.rect(x + w - 5, y + 2, 3, h - 2).fill(0x78350f);
    g.rect(x, y + h - 1, w, 1).fill(0x92400e);
  }

  private drawBox(g: Graphics, x: number, y: number, w: number, h: number, _label: string): void {
    g.rect(x, y, w, h).fill(0xb45309);      // cardboard brown
    g.rect(x + 1, y + 1, w - 2, h - 2).fill(0xd97706); // cardboard lighter face
    g.rect(x + w / 2 - 0.5, y, 1, h).fill(0x92400e);  // packing tape vertical
    g.rect(x + 2, y + 2, 4, 3).fill(0xfef3c7);         // white shipping barcode label
  }
}
