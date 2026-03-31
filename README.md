# คู่มือการติดตั้งและใช้งานระบบ Stripe PromptPay & PWA Display

ชุดพัฒนานี้ (Standalone Package) ประกอบด้วยไฟล์สำคัญที่ใช้ในการสร้างระบบ "สแกนจ่ายผ่านหน้าจอแท็บเล็ต" สำหรับร้านค้า โดยเชื่อมต่อกับ Stripe API (PromptPay) และแสดงผลบนหน้าจอฝั่งลูกค้าแบบ Real-time

---

## 1. โครงสร้างไฟล์ในชุดพัฒนา

1.  **`server_example.js`**: โค้ดตัวอย่างฝั่ง Backend (Node.js/Express)
    *   จัดการระบบ **SSE (Server-Sent Events)** เพื่อส่งข้อมูลไปหาแท็บเล็ต
    *   เชื่อมต่อกับ **Stripe API** เพื่อสร้าง QR Code PromptPay
    *   มีระบบ **Caching** ล่าสุด เพื่อให้หน้าจอไม่หายเมื่อเน็ตหลุด
2.  **`pwa/`**: ไฟล์สำหรับหน้าจอแท็บเล็ตลูกค้า
    *   `index.html`: หน้าจอหลักที่คอยรับสัญญาณและแสดงผล (มีระบบ Fullscreen)
    *   `manifest.json`: ไฟล์สำหรับระบุความเป็น PWA เพื่อให้ติดตั้งเป็น App บนหน้าจอแท็บเล็ตได้
3.  **`pos/`**: ไฟล์สำหรับเครื่องคิดเงิน (POS Client)
    *   `stripePayment.js`: ฟังก์ชันพื้นฐานสำหรับเรียกใช้ API ข้ามเครื่อง
    *   `ActiveSaleInterface_Snippet.jsx`: ตัวอย่างโค้ด React สำหรับนำไปปรับใช้ในหน้าชำระเงิน

---

## 2. การเตรียมความพร้อม (Prerequisites)

-   **Node.js**: ติดตั้งเวอร์ชัน 14 ขึ้นไป
-   **Stripe Account**: สมัครใช้งาน Stripe Thailand และขอ `Secret Key` จาก Dashboard
-   **Network**: เครื่อง Server และแท็บเล็ตต้องอยู่ในวงเน็ตเวิร์กเดียวกัน (หรือใช้ Internet ที่เข้าถึง Server ได้)

---

## 3. ขั้นตอนการติดตั้ง (Setup Steps)

### ก. ฝั่ง Server
1.  ติดตั้ง Library ที่จำเป็น:
    ```bash
    npm install express stripe cors
    ```
2.  เปิดไฟล์ `server_example.js` และใส่ **Stripe Secret Key** ของคุณที่บรรทัดบนสุด:
    ```javascript
    const stripe = require('stripe')('sk_test_...สุ่มคีย์ของคุณที่นี่...');
    ```
3.  รันเซิร์ฟเวอร์:
    ```bash
    node server_example.js
    ```
    *เซิร์ฟเวอร์จะรันที่พอร์ต `3001`*

### ข. ฝั่งแท็บเล็ตลูกค้า (PWA Display)
1.  นำโฟลเดอร์ `pwa/` ไปวางในโฟลเดอร์ Public ของ Server หรือโฮสต์แยกต่างหาก
2.  เปิด Browser บนแท็บเล็ตไปที่: `http://[IP_เครื่อง_Server]:3001/pwa/index.html`
3.  **สำคัญ**: แนะนำให้กด "Add to Home Screen" เพื่อให้แอปทำงานแบบเต็มจอ (Fullscreen)
4.  หน้าจอจะสุ่ม **Terminal ID** ขึ่นมา (เช่น `Display-XYZ`) ให้นำ ID นี้ไปใช้ฝั่ง POS

---

## 4. หลักการทำงานของระบบ (Workflow)

1.  **SSE Connection**: แท็บเล็ตจะเชื่อมต่อมาที่ Server และรอรับสัญญาณแบบ Long-connection
2.  **Payment Request**: เมื่อ POS กดปุ่ม "Pay Online" ระบบจะเรียกฟังก์ชัน `createStripePromptPayIntent`
3.  **QR Generation**: Stripe ส่ง QR Payload กลับมาที่ Backend และ Backend ส่งต่อไปยัง POS
4.  **Push to Display**: POS สั่ง `pushToDisplay` พร้อมระบุ Terminal ID -> Server จะทำการส่ง QR ไปที่แท็บเล็ตทันที
5.  **Success Notification**: เมื่อจ่ายเงินสำเร็จ POS จะตรวจพบสถานะจาก Stripe และสั่งให้ Server ส่งสัญญาณ "Success" ไปยังแท็บเล็ตเพื่อแสดงเครื่องหมายถูก ✅

---

## 5. การตั้งค่าเพิ่มเติม

-   **เปลี่ยน ID หน้าจอ**: หากต้องการระบุ ID หน้าจอเอง (เช่น จอเบอร์ 1, จอเบอร์ 2) ให้กดปุ่ม Config ลับที่มุมขวาบนของหน้าจอแท็บเล็ต (Opacity จะจางมากเพื่อไม่ให้ลูกค้าเห็น)
-   **ระบบ Caching**: หากแท็บเล็ตปิดหน้าจอหรือหลุด เมื่อเปิดกลับมาใหม่ QR เดิมจะยังแสดงอยู่โดยอัตโนมัติ

---
*เอกสารฉบับละเอียดจัดทำขึ้นเพื่อการติดตั้งระบบ POS Stripe Integration v1.1*
