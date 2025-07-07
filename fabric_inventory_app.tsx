import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, Camera, Package, MapPin, Tag, Filter, X, Plus, Edit, Sparkles, MoreHorizontal } from 'lucide-react';

const FabricInventoryApp = () => {
  const [fabrics, setFabrics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [uploadingForId, setUploadingForId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const fileInputRef = useRef(null);

  const fabricData = `1,3 PASS BO - WHITE - COL 15,Vải 3 PASS BO - WHITE - COL 15 Khổ 280cm,m,45.97,T4 giữa A-B (phía trong),lót,"Lỗi nhẹ, bẩn, mốc nhẹ"
2,33139-2-270,Vải 33139-2-270 Khổ 280cm,m,45.9,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
3,71022-10,Vải lá màu trắng W280 cm,m,29,T4 B1.2,,,
4,71022-7,Vải 71022-7 Khổ 280cm,m,54,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
5,8015-1,Vải 8015-1 Khổ 290cm,m,12.49,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
6,8059,Vải 8059 Khổ 280cm,m,36.7,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
7,99-129-39,Vải 99-129-39 khổ 280cm,m,85.8,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
8,A9003-5,Vải A9003-5 Khổ 280cm,m,45.1,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
9,AS22541-5,"AS22541-5 - 100% Polyeste W285cm, color: 5",m,16.1,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
10,AS22878-7,"AS22878-7 - 100% Polyeste, W280cm, color: 7",m,15,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
11,DCR-71022-8,Vải Lá Màu Xanh W280cm,m,387,T4 B2.2,,,
12,DCR-MELIA-NHẠT,DCR-MELIA NHẠT W280cm,m,28,T4.B3.2,,,
13,FB15141A21,Vải FB15141A21 Khổ 300cm,m,10.8,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
14,FB15144A3,Vải chính FB15144A3# khổ 290cm,m,63.2,T4.A3.1,,,
15,FB15148A21,Vải FB15148A21 Khổ 300cm,m,18.4,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
16,FB15157A1,Vải FB15157A1 Khổ 300cm,m,18.6,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
17,FB15169A4,Vải FB15169A4 Khổ 300cm,m,13,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
18,FB15198A5,Vải FB15198A5 Khổ 300cm,m,15.4,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
19,FB15198A6,Vải FB15198A6 Khổ 300cm,Cuộn,76,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
20,FS-PURPLE,Vải FS-PURPLE Khổ 280cm,m,64.5,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
21,FS-Ruby,Vải FS-Ruby Khổ 280cm,m,58.85,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
22,FS-TEAL,Vải FS-TEAL Khổ 280cm,m,157,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
23,HB/BST/DY,Vải HB/BST/DY Khổ 290cm,m,12.3,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
24,HY FAGEL-SILVER,Vải HY FAGEL-SILVER Khổ 280cm,m,45.97,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
25,JK090E-01,Vải JK090E-01 Khổ 280cm,m,27,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
26,JNF/19,Vải JNF/19 Khổ 280cm,m,16.2,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
27,Lót bông nhăn,Vải Lót bông nhăn Khổ 235cm,m,38.83,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
28,N208BOFR,Vải N208BOFR Khổ cm,m,50,T4 Palet giữa F-G,Roller,,
29,SG21-19-4007,Vải SG21-19-4007 Khổ 280cm,m,44,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
30,W5601-20,Vải W5601-20 khổ 140cm,m,7,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
31,YB0320-7,Vải YB0320-7 Khổ cm,m,12,T4 D2,,,
32,YB093,Vải YB093 khổ 230cm,m,136,T4 giữa A-B (phía ngoài),,"Lỗi nhẹ, bẩn, mốc nhẹ"
33,YB096,Vải YB096 Khổ 280cm,m,6.9,T4 giữa A-B (phía trong),,"Lỗi nhẹ, bẩn, mốc nhẹ"
34,0248243680103,Vải Panama Pro Of 1% BJ01A white- pearl khổ 250 cm,m,4.2,T4.G2.1,Roller,,
35,0248243802071-TUISS,BD03A TRAVERTINE FABRIC khổ 310cm,m,22,T4.G2.1,Roller,,
36,07013D-88,Vải chính 07013D-88 khổ 145cm,m,19.5,T4 G3.1,,,
37,089C-1,089C-1 W150cm,m,17,T4 F3,,,
38,09-730-17,Vải chính 09-730-17 khổ 140cm,m,95.5,T4 F1,Vải bọc,,
39,100054-0081,Vải Roller 100054-0081,m,12.85,T4 D3+E3,Roller,Vải tồn cũ,
40,10-780-14,Vải chính 10-780-14 khổ 140cm,m,64.6,T4 G3.1,,,
41,10-780-1402,10-780-1402 W140cm,m,165.7,T4 G3.1,,,
42,10-780-17,Vải chính 10-780-17 khổ 140cm,m,154.9,T4.H2,,,
43,10-780-316,Vải 10-780-316 W140cm,m,263.7,T4 F1,Vải bọc,,
44,10-780-41,10-780-41 W140cm,m,78.19999999999999,T4 F1 ,Vải bọc,,
45,10-780-5,10-780-5 W140cm,m,20,T4 G3.1,,,
46,131-254,Vải 131-254 W140cm,m,13.2,T4 G3.1,,,
47,142421-DCR,Vải chính 142421-DCR khổ 293cm,m,8.7,T4 G3.1,,,
48,1803 BLACKOUT,Vải 1803 BLACKOUT khổ 280cm,m,57,T4.A1.1,,,
49,22A-990-5,22A-990-5 W140cm,m,47.9,T4.H1,,,
50,22D-990-8,22D-990-8 W140cm,m,90,T4 F1,Vải bọc,,
51,22E-990-10,22E-990-10 W140cm,m,15.3,T4 G3.1,,,
52,22E-990-2,22E-990-2 W140cm,m,30.8,T4 F3,,,
53,22E-990-4,Vải Chính 22E-990-4 W140cm,m,81.2,T4 F1,Vải bọc,,
54,316-2,Vải chính 316-2 khổ 145cm,m,34,T4.H1,,,
55,3c-40-11,Vải 3c-40-11 W280cm,m,20,T4 E2,,,
56,50-008 dcr-T203 SB-12,Vải Roller 100050-008 dcr-T203 SB-12 W200cm,m,23,T4 D3+E3,Roller,Vải tồn cũ,
57,71022-10,Vải lá màu trắng W280 cm,m,29,T4 B1.2,,,
58,71022-2,Vải chính 71022-2 khổ 280cm,m,29.5,T4 D2,,,
59,71022-9,Vải lá màu kem W280 cm,m,52.3,T4 B2.2,,,
60,8000,8000 W140cm,m,170,T4 F1,Vải bọc,,
61,8136-2,Vải 8136-2 W280cm,m,20,T4 E2,,,
62,83082-11,Vải chính 83082-11 khổ 145cm,m,110.6,T4 F3,,,
63,83082-32,Vải 83082-32 khổ 145cm,m,41.5,T4 F3,,,
64,83086-06,83086-06 W145cm,m,37,T4.K3,,,
65,83086-08,Vải 83086-08 khổ 145cm,m,14.5,T4 G3.1,,,
66,83086-11,83086-11 W145cm,m,29, T4.K3,,,
67,83086-13,Vải 83086-13 W145cm,m,93.8,T4 G3.1,,,
68,83086-20,Vải chính 83086-20 khổ 145cm,m,35.5,T4 F3,,,
69,83100-13,Vải chính 83100-13 khổ 145cm,m,27.5,T4 G3.1,,,
70,83102-19,Vải Chính 83102-19 W140cm,m,85,T4 F1,Vải bọc,,
71,83813-7,83813-7 W140cm,m,14,T4 G3.1,,,
72,8525-26,8525-26 W140cm,m,15,T4.K3,,,
73,8525-42,Vải chính 8525-42 khổ 145cm,m,23,T4 F1,Vải bọc,,
74,8525-43,Vải 8525-43 khổ 145cm,m,79.1,T4 G3.1,,,
75,8525-46,8525-46 W140cm,m,13.3,T4 G3.1,,,
76,8542-11,8542-11 W140cm,m,11,T4.K3,,,
77,8557-06,Vải chính 8557-06 khổ 145cm,m,36.5,T4.K2,,,
78,8568-05,Vải Chính 8568-05 W140cm,m,37.8,T4 G3.1,,,
79,8598-02,Vải 8598-02 W140cm,m,28,T4 F3,,,
80,8600-06,Vải Roller 8600-06 W140cm,m,17,T4 F3,,,
81,8600-07,Vải Chính 8600-07 W140cm,m,26,T4 F3,,,
82,8611-44,8611-44 W140cm,m,22,T4.K3,,,
83,8611-46,Vải 8611-46 W140cm,m,40,T4 G3.1,,,
84,8612-25,Vải 8612-25 W140cm,m,14.3,T4 G3.1,,,
85,8613-04,Vải chính 8613-04 khổ 145cm,m,40,T4 F3,,,
86,8613-13,Vải 8613-13 khổ 145cm,m,25.8,T4 G3.1,,,
87,8614-09,Vải chính 8614-09 khổ 145cm,m,9.5,T4.K3,,,
88,8615-14,8615-14 W140cm,m,16.5,T4.K3,,,
89,8628-17,8628-17 W140cm,m,19.5,T4 F3,,,
90,8631-05,Vải chính 8631-05 khổ 145cm,m,64.5,T4 F1,Vải bọc,,
91,88-539-10,88-539-10,m,105.5,T4 B1.2,,,
92,88-539-12,Vải chính 88-539-12 khổ 280cm,m,70.8,T4 B1.2,,,
93,88-539-21,Vải chính 88-539-21 khổ 280cm,m,72.3,T4 B1.2,,,
94,88-539-23,88-539-23 W280cm,m,95.5,T4 B1.2,,,
95,88-539-9,88-539-9 W280cm,m,81.4,T4 B1.2,,,
96,91200201S0103,91200201S0103 W300cm,m,10,T4 Palet G-F,Roller,,
97,99-129-11,99-129-11 W280cm,m,16,T4 B1.2,,,
98,99-129-44,99-129-44 W280cm,m,41,T4 D1 + E1,,,
99,A6120A195,"A6 BON SOIR FABRIC, 150ft per carton, 3m width",m,10,T4 Palet G-F,Roller,,
100,A65-2,Vải Voan  A65-2 W280cm,m,94,T4 E2,,,
101,AL200-21,Vải Chính AL200-21 W140cm,m,34,T4 F1,Vải bọc,,
102,AL200-30,AL200-30 W280cm,m,30,T4 F1,Vải bọc,,
103,Ar070-02B,Vải Ar070-02B W140cm,m,11,T4 G3.1,,,
104,AR-071-02B,VẢI HÌNH CÁ HEO NÂU W140cm,m,9,T4 F3,,,
105,AR074-02B,AR074-02B W140cm,m,18.5,T4 F3,,,
106,AR-076-02B,Vải chính AR-076-02B khổ 150cm,m,47,T4 F3,,,
107,AR-079-02B,Vải chính AR-079-02B khổ 150cm,m,18,T4 G3.1,,,
108,ASPERO 19,Vải chính ASPERO 19 khổ 141cm,m,18,T4.K3,,,
109,BD095-298,Vải chính BD095-298 khổ 145cm,m,17,T4.K3,,,
110,BD095-85,Vải chính BD095-85 khổ 145cm,m,163,T4.K2,,,
111,BERTONE-30,Vải chính BERTONE-30 khổ 295cm,m,81.5,T4.H1,,,
112,BERTONE-31,Vải chính BERTONE-31 khổ 295cm,m,60,T4.H1,,,
113,BJ01A,BJ01A W310cm,m2,77,T4.G2.2,Roller,,
114,Bloom R/B Amellie,Vải Roller Bloom R/B Amellie,m,18,T4 D3+E3,Roller,Vải tồn cũ,
115,BO300102,Vải Coated Fabric Linen 300cm,m,45,T4 Palet G-F,Roller,,
116,Bonaza mufin-28,Vải Bonaza mufin-28 W140cm,m,83.5,T4 F3,Vải bọc,,
117,BWB8136-4,Vải chính BWB8136-4 W280cm,m,110,T4 E2,,,
118,BWB-8539,Vải Voan BWB-8539 (Chiffon Cream) khổ 295cm,m,287.5,T4 D2 + T4 dưới sàn,voan,"Lỗi sợi, bẩn",
119,carnival  r/b purple,Vải Roller dcr-carnival  r/b purple-Kg W200cm,m,10,T4 D3+E3,Roller,Vải tồn cũ,
120,CARNIVAL R/B HESSIAN 210,Vải Roller CARNIVAL R/B HESSIAN 210 W200cm,m,10,T4 D3+E3,Roller,Vải tồn cũ,
121,carnival r/b hot pink 210,Vải Roller dcr- carnival r/b hot pink 210 W200cm,m,30,T4 D3+E3,Roller,Vải tồn cũ,
122,Carnival r/b mauve 210,Vải Roller Dcr Carnival r/b mauve 210 W200cm,m,10,T4 D3+E3,Roller,Vải tồn cũ,
123,CARNIVAL R/B MULBERRY 210,Vải Roller DCR CARNIVAL R/B MULBERRY 210 W200cm,m,33,T4 D3+E3,Roller,Vải tồn cũ,
124,carnival r/b slate 210,Vải Roller dcr- carnival r/b slate 210 W200cm,m,13,T4 D3+E3,Roller,Vải tồn cũ,
125,CARNIVAL R/B TEAL 210,Vải Roller CARNIVAL R/B TEAL 210 W200cm,m,11,T4 D3+E3,Roller,Vải tồn cũ,
126,CRUSHED VELVET-15,Vải chính CRUSHED VELVET-15 khổ 280cm,m,27,T4.A3.1,,,
127,D-3195,Vải chính D-3195 khổ 150cm,m,7.5,T4 G3.1,,,
128,D3385,Vải chính D3385 khổ 145cm,m,11, T4.K3,,,
129,Datender 24sil,Datender 24sil W140cm,m,21.8,T4 G3.1,,,
130,DBY80434-3,Vải DBY80434-3 W140cm,m,8,T4 G3.1,,,
131,DBY80434-51,Vải DBY80434-51 W140cm,m,18,T4 G3.1,,,
132,DCLR -EC-4022,Vải Roller DCLR -EC-4022 W200cm,m,9,T4 D3+E3,Roller,Vải tồn cũ,
133,DCR - chats word white,Vải Roller DCR - chats word white W200cm,m,26,T4 D3+E3,Roller,Vải tồn cũ,
134,dcr- chats word cream,Vải Roller dcr- chats word cream W200cm,m,53,T4 D3+E3,Roller,Vải tồn cũ,
135,DCR HL-814F,Vải Roller DCR HL-814F W200cm,m,7,T4 D3+E3,Roller,Vải tồn cũ,
136,Dcr -Lauva r/b walnut,Vải Roller Dcr -Lauva r/b walnut W200cm,m,8,T4 D3+E3,Roller,Vải tồn cũ,
137,dcr- nouveaux r/b teal,Vải Roller dcr- nouveaux r/b teal W200cm,m,26,T4 D3+E3,Roller,Vải tồn cũ,
138,DCR-1000-2300-9000,Vải Roller DCR-1000-2300-9000 W200cm,m,19.5,T4 D3+E3,Roller,Vải tồn cũ,
139,DCR-1000-2300-9124,DCR-1000-2300-9124 W200cm,m,6,T4 D3+E3,Roller,Vải tồn cũ,
140,DCR-1000-2300-9162,Vải Roller DCR-1000-2300-9162 W200cm,m,15,T4 D3+E3,Roller,Vải tồn cũ,
141,DCR-1000-2300-9163,Vải Roller DCR-1000-2300-9163 W200cm,m,16.8,T4 D3+E3,Roller,Vải tồn cũ,
142,DCR20018,Vải Roller DCR20018 W200cm,m,22,T4 D3+E3,Roller,Vải tồn cũ,
143,DCR-71022-8,Vải Lá Màu Xanh W280cm,m,367.3,T4 B2.2,,,
144,DCR-BRERA-33,Vải chính  DCR-BRERA-33 khổ 140cm,m,45.8,T4 G3.1,,,
145,Dcr-carnival R/B mocha,Vải Roller Dcr-carnival R/B mocha W200cm,m,10,T4 D3+E3,Roller,Vải tồn cũ,
146,DCR-EC-4037F,Vải Roller DCR-EC-4037F W200cm,m,6,T4 D3+E3,Roller,Vải tồn cũ,
147,DCR-ES-48,Vải Roller DCR-ES-48 W200cm,m,5,T4 D3+E3,Roller,Vải tồn cũ,
148,DCR-HA 1754-16,Vải chính DCR-HA 1754-16 khổ 145cm,m,53,T4.H1,,,
149,DCR-HA 1754-7 BLACKCURRAN,Vải chính DCR-HA 1754-7 BLACKCURRANT khổ 145cm,m,28.5,T4.H1,,,
150,DCR-HA 1754-9,Vải chính DCR-HA 1754-9 khổ 145cm,m,65,T4.H2,,,
151,DCR-MELIA-COFFEE,DCR-MELIA-COFFEE W280cm,m,1366.37,T4.B3.1,,,
152,DCR-MELIA-NHẠT,DCR-MELIA NHẠT W280cm,m,28,T4.B3.2,,,
153,DCR-N2087-Bo w280cm,Vải DCR-N2087-Bo w280cm,m,570,T4.G1.2,Roller,,
154,DCR-OZONE-16,DCR-OZONE-16 W280cm,m,75,T4 E2,,,
155,DCR-RP1113,Vải Roller DCR-RP1113 W200cm,m,17,T4 D3+E3,Roller,Vải tồn cũ,
156,DCR-RP1120,Vải Roller DCR-RP1120 W200cm,m,30,T4 D3+E3,Roller,Vải tồn cũ,
157,DCR-RP1145,Vải Roller DCR  - R1145 W200cm,m,20,T4 D3+E3,Roller,Vải tồn cũ,
158,DCR-RP1148,Vải Roller DCR-RP1148 W200cm,m,15,T4 D3+E3,Roller,Vải tồn cũ,
159,DCR-RP1151,Vải Roller DCR-RP1151 W200cm,m,10,T4 D3+E3,Roller,Vải tồn cũ,
160,DCR-RP1153,Vải Roller DCR-RP1153 W200cm,m,20,T4 D3+E3,Roller,Vải tồn cũ,
161,DCR-RP1163,Vải Roller DCR-RP1163 W200cm,m,11,T4 D3+E3,Roller,Vải tồn cũ,
162,DCR-RP1193,Vải Roller DCR-RP1193 W200cm,m,18,T4 D3+E3,Roller,Vải tồn cũ,
163,DCR-RP2000,Vải Roller DCR-RP2000 W200cm,m,25,T4 D3+E3,Roller,Vải tồn cũ,
164,DCR-RP2007,Vải Roller DCR-RP2007 W200cm,m,8.6,T4 D3+E3,Roller,Vải tồn cũ,
165,DCR-RP2010,Vải Roller DCR-RP2010 W200cm,m,25.25,T4 D3+E3,Roller,Vải tồn cũ,
166,DCR-RP2328,Vải DCR-RP2328 W200cm,m,15,T4 D3+E3,Roller,Vải tồn cũ,
167,DCR-RP2365,Vải Roller DCR-RP2365 W200cm,m,15,T4 D3+E3,Roller,Vải tồn cũ,
168,DCR-RP770,Vải Roller DCR-RP770 W200cm,m,17.9,T4 D3+E3,Roller,Vải tồn cũ,
169,dcr-snong bird beyl,Vải Roller dcr-snong bird beyl-Kg W200cm,m,7,T4 D3+E3,Roller,Vải tồn cũ,
170,DCR-ST6026,Vải Roller DCR-ST6026 W200cm,m,17,T4 D3+E3,Roller,Vải tồn cũ,
171,DH25-A4-120,Vải chính  DH25-A4-120 khổ 145cm,m,9.9,T4.A3.1,,,
172,DH25-B2-120,Vải chính  DH25-B2-120 khổ 145cm,m,20.9,T4.A3.1,,,
173,Dusk Slate - 3M,Vải 4915161-Dcr - Dusk Slate - W300cm,m2,168,T4 D3+E3 + T4 dưới sàn,Roller,Vải tồn cũ,
174,EB 36360688T,Vải Roller EB 36360688T W200cm,m,14,T4 D3+E3,Roller,Vải tồn cũ,
175,EB48410186,EB48410486 W300cm,m2,186,T4.G1.1,Roller,,
176,EB5448 ALA PASTER,Vải mành EB5448 ALA PASTER khổ 250,m2,65.1,T4 Palet G-F,Roller,,
177,EF214-04,EF214-04 W140cm,m,127,T4 G3.1,,,
178,EF216-05,EF216-05 W140cm,m,75,T4.H1,,,
179,EF218-02,Vải Chính EF218-02 W140cm,m,48,T4 F1,Vải bọc,,
180,EF218-5,EF218-5 W140cm,m,63.95,T4.H1,,,
181,EF51150133-dcr,Vải EB51150133 white/mushroom - 2.5M,m2,192,T4.G1.1,Roller,,
182,EF-BOD7543-TUISS,EF-BOD7543-TUISS W300cm,m2,84,T4 Palet G-F,Silhouette,,
183,EF-BON7531-TUISS,EF-BON7531-TUISS W300cm,m2,134.4,T4 Palet G-F,Silhouette,,
184,ELITEX EB5115 WHITE/MUSHR,ELITEX EB5115 WHITE/MUSHROOM khổ 300cm,m2,521,T4.G1.1,Roller,,
185,ET66470183,Vải Elitex - ET66470183 Pale Grey - khổ 250,m2,138.5,T4.G1.1,Roller,,
186,F00614-20,Vải F00614-20 khổ 140cm,m,10,T4.K3,,,
187,F02-Front-28022023,Vải B Fabric Sample With FR (F02-Front-28022023) Thổ khổ 280cm,m,747,T4.A3.2,,,
188,F13-NB03300105,Vải F13-NB03300105 W300cm,m,30,T4 Palet G-F,Roller,,
189,F14-DUSK MARTINI,F14-DUSK MARTINI (MARIAH) - TUISS khổ 300cm,m2,270,T4.G2.2,Roller,,
190,FB15092A8,Vải FB15092A8 khổ 290cm,m,10,T4.A3.1,,,
191,FB15144A3,Vải chính FB15144A3# khổ 290cm,m,97.97,T4.A3.1 và T4F2 + giữa kệ A và B,,,
192,FB15151A2,FB15151A2# FR-NFPA - vải mềm khổ 290cm,m,35,T4 D2,,,
193,FB15168A4,Vải chính FB15168A4 khổ 290cm,m,17.4,T4.A3.1,,,
194,FB17118A7-4,Vải chính FB17118A7-4 khổ 280cm,m,413.4,T4.A1.1,,,
195,FB17118A-BWB-28,Vải chính FB17118A-BWB-28 khổ 280cm,m,13,T4.A3.1,,,
196,FB17118A-BWB-30,Vải chính FB17118A-BWB-30 khổ 280cm,m,10.7,T4.A3.1,,,
197,FB17141A-1,Vải chính FB17141A-1 khổ 280cm,m,8.2,T4.A3.1,,,
198,FB17195A-3,Vải chính FB17195A-3 khổ 280cm,m,22.4,T4.A3.1,,,
199,FS-GUNMETAL,Vải chính FS-GUNMETAL khổ 280cm,m,31,T4.A3.1,,,
200,FWP12157-16,Vải chính  FWP12157-16 khổ 280cm,m,70.2,T4.A3.1,,,
201,G8002-01,Vải G8002-01 Thổ khổ 140cm,m,12,T4.A3.1,,,
202,H01,Vải chính H-01 khổ 280cm,m,75,T4 F1,Vải bọc,,
203,HA 1754-10,Vải chính HA 1754-10 khổ 145cm,m,60.5,T4.H1,,,
204,HA 1754-11,HA 1754-11 khổ 145cm,m,335,T4.H1,,,
205,HA 1754-4,Vải chính HA 1754-4 khổ 145cm,m,120,T4.H1,,,
206,HA1754-0701D-28,Vải Chính HA1754-0701D-28 khổ 145cm,m,45.7,T4.H1,,,
207,HBM BLACKOUT HUESO,Vải HBM BLACKOUT HUESO khổ 280cm,m,37,T4 B2.1,,,
208,HENILY R/B RUN BN,Vải Roller DCR-HENILY R/B RUN BN  RAI SIN W 200cm,m,17,T4 D3+E3,Roller,Vải tồn cũ,
209,HLR-17,Vải chính HLR-17 khổ 140cm,m,9.5,T4 F2,Vải bọc,,
210,HLR-25,Vải chính HLR-25 khổ 140cm,m,8.6, T4.K3,,,
211,HLR-5,Vải chính HLR-5 khổ 140cm,m,9,T4.K3,,,
212,HOLIWOD-04,Vải HOLIWOD-04 khổ 280cm,m,9,T4 E2,,,
213,HTK 20189-11,Vải HTK 20189-11 khổ 280cm,m,570,T4.A2.2,,,
214,HTK-20125,Vải chính HTK-20125 khổ 280cm,m,13,T4 Thùng đất 5,,,
215,IBI-2,Vải chính IBI-2 khổ 280cm,m,7.2,T4 F3,,,
216,ICON WAR WICK - COLOR,Vải ICON WAR WICK - COLOR - AQUA khổ 300cm,m,43,T4 G3.1,,,
217,ICT-01,ICT-01 khổ 140cm,m,18,T4 G3.1,,,
218,ICT-02,ICT-02 khổ 140cm,m,10,T4 G3.1,,,
219,JBL54452-39,Vải JBL54452-39 khổ 140cm,m,20.1,T4 G3.1,,,
220,JBL54452-53,Vải TBL54452-53 khổ 140cm,m,8.7,T4 G3.1,,,
221,LIBERTY-05,LIBERTY-05 khổ 140cm,m,6.8,T4 F3,,,
222,LỤA ÉP HỌA TIẾT,Vải lụa ép họa tiết (8600-07) khổ 280cm,m,7,T4 E2,,,
223,M-149,M-149 khổ 140cm,m,40,T4 F3,,,
224,M61,M61 khổ 140cm,m,30,T4 F3,,,
225,m907-12,Vải m907-12 khổ 140cm,m,53,T4.K3,,,
226,M907-9,M907-9 khổ 140cm,m,19,T4.H2,,,
227,M908-26,Vải chính M908-26 khổ 145cm,m,32.4,T4 G3.1,,,
228,madrid canaval 210,Vải Roller DCR-madrid spc R/B canaval 210 W 200cm,m,38,T4 D3+E3,Roller,Vải tồn cũ,
229,MARINO-43,Vải chính MARINO-43 khổ 142cm,m,9.7,T4.K3,,,
230,MJ304-03,MJ304-03 W 140cm,m,100.5,T4.H2,,,
231,MJ428-06,MJ428-06 W 200cm,m,102.8,T4.H2,,,
232,MJ428-14,MJ428-14 W 200cm,m,129.9,T4.H2,,,
233,moir,Vải MOIR W 140cm,m,164.1,T4.H1,,,
234,MUNNAR SILK-23283,Vải chính MUNNAR SILK-23283 khổ 300cm,m,10.9,"T4.A3.1 tấm lẻ 7,7+3,2",,,
235,NB01300103,Vải Roller NB01300103 khổ 300cm,m,136,T4 Palet G-F,Roller,,
236,NB150629D-2,Vải Chính NB150629D-2 W 140cm,m,37.5,T4.H1,,,
237,PRJ-EB4834,Vải Roller PRJ-EB4834 linen 10% opening W 200cm,m,52.5,T4 D3+E3,Roller,Vải tồn cũ,
238,PRJ-HATCH CHENILLE - D,Vải chính PRJ-HATCH CHENILLE - D khổ 145cm,m,45.5,T4.K3,,,
239,PRJ-honey Bo,Vải Roller PRJ-honey Bo W 280cm,kg,13,T4 G3.1,,,
240,PRJ-OXC B008-DCR,PRJ-OXC B008-DCR khổ 280cm,m,5,T4 Palet G-F,Roller,"Lỗi Vải, ố mốc nhẹ",
241,PRT-40273 FR,PRT-40273 FR W 280cm,m,25,T4 Palet G-F,Roller,,
242,R700-05,R700-05 W 140cm,m,20,T4 F2,Vải bọc,,
243,R700-1,R700-1 W 140cm,m,59.1,T4.H2,,,
244,R700-15,R700-15 W 140cm,m,32.4,T4.K3,,,
245,R700-19,Vải R700-19 W 140cm,m,22.5,T4 G3.1,,,
246,Satin Apex SA 9196 Chintz,Vải chính Satin Apex SA 9196 Chintz Vũ Huỳnh khổ 140cm,m,24,T4 G3.1,,,
247,SDWY0035-21-7542-HF-NG,SDWY0035-21-7542-HF-NG W 280cm,m,107.6,T4 B2.2 ,,,
248,SG21-YH56-1,Vải SG Màu kem W280,m,31,T4 B2.2,,,
249,ST 5049 CjNcc,Vải Roller ST 5049 CjNcc W 280cm,m,120,T4 Palet G-F,Roller,,
250,ST-5031F,Vải Roller ST-5031F W 200cm,m,8,T4 D3+E3,Roller,Vải tồn cũ,
251,ST5082,Vải Roller ST5082 W 200cm,m,15,T4 D3+E3,Roller,Vải tồn cũ,
252,T201,Vải Roller T201 W 200cm,m,8,T4 D3+E3,Roller,Vải tồn cũ,
253,TF13590-002,Vải Chính TF13590-002 W 140cm,m,65,T4.H1,,,
254,TF13590-4,TF13590-4 W 140cm,m,38.98,T4.H1,,,
255,TF13950-006,Vải TF13950-006 khổ 140cm,m,102.8,T4.H1,,,
256,TM17-37,Vải chính TM17-37 thượng mỹ khổ 280cm,m,40,T4 G3.1,,,
257,TP01623-00229,TP01623-229 W 140cm,m,46,"T4 F1,2+ T2E2",Vải bọc,,
258,TP01623-0035,Vải TP01623-35 W 140cm,m,81.03,T4 G3.1,,,
259,TP01623-219,Vải chính TP01623-219 khổ 140cm,m,10,T4 F1,Vải bọc,,
260,TP01623-222,Vải chính TP01623-222 khổ 140cm,m,10,T4 F3,,,
261,TP01623-224,Vải chính TP01623-224 khổ 140cm,m,12.5,T4 F1,Vải bọc,,
262,TP01623-228,Vải chính TP01623-228 khổ 140cm,m,5.9,T4 F1,Vải bọc,,
263,TP01623-6010,Vải TP01623-6010 W 140cm,m,54,T4 G3.1,,,
264,TP13590-003,Vải TP13590-003 W 140cm,m,92,T4.H2,,,
265,TP229,Vải Chính TP229 W 140cm,m,17,T4 F2 ,Vải bọc,,
266,UN 1371,Vải Mành Roller EUROSCREEN W 280cm,m,5.5,T4.G2.1,,,
267,V01,Vải V01 W 280cm,m,25,T4 E2 ,,,
268,vải nhung màu be,Vải vải nhung màu be W 140cm,m,10,T4 F1,Vải bọc,,
269,Vải nhung màu xanh,Vải Vải nhung màu xanh W 140cm,m,7.8,T4 G3.1,,,
270,VELVET NAMPA 282-4101,Vải VELVET NAMPA 282- 4101  khổ 140cm,m,33,T4 G3.1,,,
271,VELVET NAMPA 284-54247,Vải VELVET NAMPA 284- 54247  khổ 140cm,m,36.6,T4 G3.1,,,
272,VN 10808,Vải chính VN 10808 khổ 145cm,m,10.8,T4.H1,,,
273,VOAN HỒNG,VẢI VOAN HỒNG W 280cm,m,40,T4 E2,,,
274,Voile R/B Cream,Vải Roller Voile R/B Cream W 200cm,m,55,T4 D3+E3,Roller,Vải tồn cũ,
275,Voile R/B White,Vải Roller Voile R/B White W 200cm,m,40.5,T4 D3+E3,Roller,Vải tồn cũ,
276,VR1000-06,Vải chính MP637 145 NJ VR1000-06 khổ 145cm,m,39.8,T4 F2,Vải bọc,,
277,w5601-6,Vải w5601-6 khổ 140cm,m,72,T4.K2,,,
278,W5601-9,Vải mành W5601-9 W 140cm,m,123.5,T4.K2,,,
279,YB0822-1,Vải màu xanh - Duckegg ( 300 ) W 280cm,m,49.8,T4 B2.2,,,
280,YB180904-9,YB180904-9- bán trong nước W 280cm,m,126,T4 D1 + E1,,,
281,YBJS0617,Vải chính YBJS0617 khổ 280cm,m,109,T4.K1,,,
282,YY2156-10,Vải chính YY2156-10 khổ 280cm,m,33,T4.K1,,,
283,YY2156-12,Vải chính YY2156-12 khổ 280cm,m,10,T4.A2.2,,,
284,FS FLAX-NG,Vải FS FLAX-NG W280,m,46,Pallet tầng 2,Roller,"Lỗi Vải, ố mốc nhẹ",
285,DCT-BO-TB01-NG,Vải TREEBARK BO ROLLER BLIND FABRIC WIDTH 280 CM,m,33,Pallet tầng 2,Roller,"Lỗi Vải, ố mốc nhẹ",
286,VL-BF45(H)-NG,VẢI VALENTINE FRESH BLACKOUT WITDH 250 ( SN-BF45),m,80,Pallet tầng 2,Suntrip,,
287,HARMONY-OXC B003-NG,VẢI HARMONY-003 BLACKOUT-NG W280,m,38,Pallet tầng 2,Roller,"Lỗi Vải, ố mốc nhẹ",
288,D2070-008-NG,VẢI D2070-008-NG LỖI PHAI MÀU W280,m,405,Pallet tầng 2,Roller,"Lỗi Vải, ố mốc nhẹ",
289,D2082-001-NG,D2082-001 LÕI VÕNG NẶNG W280,m,300,Pallet tầng 2,Roller,"Lỗi Vải, ố mốc nhẹ",
290,NN-12-DK,VẢI SUNSTRIP MÀU TRẮNG W280 ( ICE WHITE B2G),m,180,Pallet tầng 2,Suntrip,,
291,HQ-1,Vải HQ-1 khổ 280cm,m,25.9,Pallet giữa kệ A và B Tầng 4,,,
292,YB14005-3,Vải YB14005-3 Khổ 300cm,m,29.5,Pallet giữa kệ A và B Tầng 4,,,
293,DCR-L4001-12122,Vải voan DCR-L4001-12122 khổ 300cm,m,57.3,Pallet giữa kệ A và B Tầng 4,voan,,
294,VLIET-PURE WHITE A,Vải voan VLIET-PURE WHITE A khổ 280cm,m,18,Pallet giữa kệ A và B Tầng 4,voan,,
295,BWB-8036-1,Vải BWB-8036-1 Khổ 280cm,m,9.9,T4B1.2,,,
296,A5583-2,Vải voan A5583-2  Khổ 280cm,m,62,T4F3+T2G2,voan,,
297,31405014,"AS22803-12 - 6% linen, 94% Polyeste W288cm, color: 12",m,92,T4C3 ,,,
298,YB0822-2,Vải YB0822-2 khổ 280cm,m,65,T4B2.2 Nhập thêm vào kho,,,
299,TP01623-140,Vải TP01623-140 khổ 140cm,m,29.2,T4F1 nhập thêm vào kho,,,
300,Dymondmie - Straw,Vải Dymondmie - Straw khổ 140cm,m,50,T4F2 Nhập thêm vào kho,,,
301,JNF-173-17104120,Vải JNF-173-17104120 khổ 280cm,m,30,T4C3 Nhập thêm vào kho,,,
302,BWB-8043,Vải màu hồng họa tiết khổ 280 cm,m,57.38,Tầng 4 giữa kệ A và B,,"Lỗi Vải, ố mốc nhẹ",
303,DCT-BO-LT-06,Vải Roller khổ 280cm,m,30,T4 dưới sàn,Roller,"Lỗi vải, loang màu",
304,DL202143311,Vải suntrip khổ 280cm,m,30,T4 dưới sàn,Suntrip,"Lỗi vải, loang màu",
305,SG21-19-4007,Vải  SG21-19-4007 khổ 280cm,m,68,T4C3,,,
306,EB16306D5,Vải  EB16306D5 khổ 280cm,m,50,T4C4,,,
307,SG màu đen,Vải SG màu đen khổ 280cm,m,12,T4C4,,,
308,SG21-14-C434,Vải SG21-14-C434 khổ 280cm,m,20,T4C4,,,
309,AS22878-6,Vải AS22878-6 khổ 280cm,m,40,T4C4,,,
310,FB15151A3,Vải FB15151A3 khổ 280cm,m,20,T4C4,,,
311,W5601-24,Vải W5601-24 khổ 280cm,m,34,T4C4,,,
312,FB15090A-21,Vải FB15090A-21 khổ 280cm,m,15,T4C4,,,
313,JNF-15-new,Vải JNF-15-new khổ 280cm,m,24.5,T4C4,,,
314,AS228388-3,Vải AS228388-3 khổ 280cm,m,25,T4C4,,,
315,HA1449-W,Vải HA1449-W khổ 280cm,m,39,T4C4,,,
316,JNF161,Vải JNF161 khổ 280cm,m,35,T4C4,,,
317,THCO-14,Vải THCO-14 khổ 280cm,m,20,T4C4,,,
318,DCT-BO-TB07,Vải DCT-BO-TB07 khổ 280cm,m,65,T4 dưới sàn,Roller,"Lỗi, bẩn",
319,DLWG202136055,Vải DLWG202136055 khổ 280cm,m,5,T4 dưới sàn,Roller,"Lỗi, bẩn",
320,DUSK XTRA VIVID,Vải DUSK XTRA VIVID khổ 300cm,m,40,T4 dưới sàn,Roller,"Lỗi, bẩn",
321,EB48500186 WINSPRAY GREY,Vải EB48500186 WINSPRAY GREY khổ 300cm,m,15,T4 dưới sàn,Roller,"Lỗi, bẩn",
322,HARMONY-OXC B003-NG (TRẮNG),Vải HARMONY-OXC B003-NG (TRẮNG) khổ 280cm,m,10,T4 dưới sàn,Roller,"Lỗi, bẩn",
323,HARMONY-OXC B014,Vải HARMONY-OXC B014 khổ 280cm,m,39,T4 dưới sàn,Roller,"Lỗi, bẩn",
324,HARMONY-OXC B12-NG,Vải HARMONY-OXC B12-NG khổ 280cm,m,22.2,T4 dưới sàn,Roller,"Lỗi, bẩn",
325,VL-BFAT 45,Vải VL-BFAT 45 khổ 280cm,m,40,T4 dưới sàn,Suntrip,"Lỗi, bẩn",
326,VL-BFAT12 (H),Vải VL-BFAT12 (H) khổ 280cm,m,18,T4 dưới sàn,Suntrip,"Lỗi, bẩn",
327,VL-BFAT96,Vải VL-BFAT96 khổ 280cm,m,35,T4 dưới sàn,Suntrip,"Lỗi, bẩn",
328,VL-FQAT42 (H),Vải VL-FQAT42 (H) khổ 280cm,m,30,T4 dưới sàn,Suntrip,"Lỗi, bẩn",
329,DCT-BO-ZH,Vải DCT-BO-ZH khổ 280cm,m,65,T4 dưới sàn,Roller,"Lỗi, bẩn",
330,HARMONY-OXC B010,Vải HARMONY-OXC B010 khổ 280cm,m,40,T4 dưới sàn,Roller,"Lỗi, bẩn",
331,SC-UDPL 15 FR,Vải SC-UDPL 15 FR khổ 240cm,m,30,T4 dưới sàn,Roller,"Lỗi, bẩn"`;

  useEffect(() => {
    const lines = fabricData.split('\n');
    const parsedFabrics = lines.map(line => {
      const [id, code, name, unit, quantity, location, type, note] = line.split(',');
      return {
        id: parseInt(id),
        code: code?.replace(/"/g, ''),
        name: name?.replace(/"/g, ''),
        unit: unit?.replace(/"/g, ''),
        quantity: parseFloat(quantity),
        location: location?.replace(/"/g, ''),
        type: type?.replace(/"/g, '') || 'Roller',
        note: note?.replace(/"/g, ''),
        image: null
      };
    });
    setFabrics(parsedFabrics);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleImageUpload = (file, fabricId) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFabrics(prev => prev.map(fabric => 
        fabric.id === fabricId 
          ? { ...fabric, image: e.target.result }
          : fabric
      ));
      setUploadingForId(null);
      setShowUploadModal(false);
    };
    reader.readAsDataURL(file);
  };

  const filteredFabrics = fabrics.filter(fabric => {
    const matchesSearch = 
      fabric.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || fabric.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || fabric.location?.includes(selectedLocation);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const uniqueTypes = [...new Set(fabrics.map(f => f.type).filter(Boolean))];
  const uniqueLocations = [...new Set(fabrics.map(f => f.location?.split(' ')[0]).filter(Boolean))];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-pink-600/20" 
             style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,rgba(120,119,198,0.3),transparent)]" />
      </div>

      {/* Header with Dynamic Island Style */}
      <div className="relative z-40">
        <div className={`backdrop-blur-3xl transition-all duration-700 ${
          searchFocused ? 'bg-black/40' : 'bg-black/20'
        } border-b border-white/10`}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Vải Tồn Kho
                  </h1>
                  <p className="text-white/60 text-sm">
                    {filteredFabrics.length} sản phẩm • Cập nhật realtime
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`p-4 rounded-2xl transition-all duration-500 ${
                    filterOpen 
                      ? 'bg-blue-500 shadow-2xl shadow-blue-500/30' 
                      : 'bg-white/10 hover:bg-white/20'
                  } backdrop-blur-xl border border-white/20`}
                >
                  <Filter className="w-5 h-5 text-white" />
                </button>
                <button className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-500 backdrop-blur-xl border border-white/20">
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Dynamic Island Search */}
            <div className={`relative transition-all duration-700 ease-out ${
              searchFocused ? 'scale-105' : 'scale-100'
            }`}>
              <div className={`relative transition-all duration-700 ${
                searchFocused 
                  ? 'bg-white/15 shadow-2xl shadow-black/20' 
                  : 'bg-white/10 hover:bg-white/15'
              } backdrop-blur-3xl rounded-3xl border border-white/20 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center">
                  <Search className={`absolute left-6 w-6 h-6 transition-all duration-500 ${
                    searchFocused ? 'text-blue-400 scale-110' : 'text-white/60'
                  }`} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm vải, mã sản phẩm, vị trí kho..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-16 pr-6 py-5 bg-transparent text-white placeholder-white/50 focus:outline-none text-lg transition-all duration-500"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Controls - iOS 18 Style */}
            {filterOpen && (
              <div className="mt-6 overflow-hidden">
                <div className="animate-in slide-in-from-top-2 duration-500 ease-out">
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    <div className="flex-shrink-0">
                      <label className="block text-white/60 text-sm font-medium mb-2">Loại vải</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 min-w-[150px]"
                      >
                        <option value="all" className="bg-gray-900 text-white">Tất cả</option>
                        {uniqueTypes.map(type => (
                          <option key={type} value={type} className="bg-gray-900 text-white">{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-shrink-0">
                      <label className="block text-white/60 text-sm font-medium mb-2">Khu vực</label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 min-w-[150px]"
                      >
                        <option value="all" className="bg-gray-900 text-white">Tất cả</option>
                        {uniqueLocations.map(location => (
                          <option key={location} value={location} className="bg-gray-900 text-white">{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFabrics.map((fabric, index) => (
            <div
              key={fabric.id}
              className="group cursor-pointer animate-in fade-in zoom-in duration-700"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedFabric(fabric)}
            >
              {/* Card Container */}
              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-hidden transition-all duration-700 hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-black/30 hover:bg-white/15">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {fabric.image ? (
                    <img
                      src={fabric.image}
                      alt={fabric.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="p-4 bg-white/10 rounded-2xl mb-3 mx-auto w-fit">
                          <Package className="w-8 h-8 text-white/60" />
                        </div>
                        <span className="text-sm text-white/40">Chưa có ảnh</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Floating Camera Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadingForId(fabric.id);
                      setShowUploadModal(true);
                    }}
                    className="absolute top-3 right-3 p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all duration-500 hover:scale-110"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Sparkle Effect */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-xl border border-blue-500/20 backdrop-blur-sm">
                      {fabric.code}
                    </span>
                    {fabric.type && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-xl border border-purple-500/20 backdrop-blur-sm">
                        {fabric.type}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white mb-3 line-clamp-2 leading-snug text-lg group-hover:text-blue-300 transition-colors duration-300">
                    {fabric.name}
                  </h3>

                  {/* Quantity */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/60 text-sm">Số lượng:</span>
                    <span className="font-bold text-green-400 text-lg">
                      {fabric.quantity} {fabric.unit}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span className="text-white/60 truncate">{fabric.location}</span>
                  </div>

                  {/* Note */}
                  {fabric.note && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl backdrop-blur-sm">
                      <span className="text-yellow-300 text-xs">{fabric.note}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal - iOS 18 Style */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="animate-in zoom-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="bg-white/15 backdrop-blur-3xl rounded-3xl border border-white/20 p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Thêm ảnh sản phẩm</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadingForId(null);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div
                className="border-2 border-dashed border-white/30 rounded-3xl p-10 text-center hover:border-blue-400/50 hover:bg-white/5 transition-all duration-500 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 bg-blue-500/20 rounded-2xl mb-4 mx-auto w-fit group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white mb-2 font-medium">Kéo thả ảnh vào đây</p>
                <p className="text-white/60 text-sm">Hoặc click để chọn file</p>
                <p className="text-white/40 text-xs mt-2">PNG, JPG, GIF (max 10MB)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && uploadingForId) {
                    handleImageUpload(file, uploadingForId);
                  }
                }}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - iOS 18 Style */}
      {selectedFabric && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-end md:items-center justify-center z-50 animate-in fade-in duration-500">
          <div className="animate-in slide-in-from-bottom-4 md:zoom-in duration-700 ease-out w-full md:w-auto">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl border border-gray-700/50 max-w-2xl w-full mx-0 md:mx-4 shadow-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-700/50 bg-gray-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Chi tiết sản phẩm</h3>
                  <button
                    onClick={() => setSelectedFabric(null)}
                    className="p-3 bg-gray-700/50 hover:bg-gray-600/70 rounded-2xl transition-all duration-300"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-900/95">
                {/* Image */}
                {selectedFabric.image && (
                  <div className="mb-6 rounded-2xl overflow-hidden bg-gray-800/50 border border-gray-700/30">
                    <img
                      src={selectedFabric.image}
                      alt={selectedFabric.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Mã vải</label>
                    <p className="text-xl font-bold text-white bg-gray-800/70 rounded-2xl p-4 border border-gray-700/50">
                      {selectedFabric.code}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Tên sản phẩm</label>
                    <p className="text-white bg-gray-800/70 rounded-2xl p-4 border border-gray-700/50 leading-relaxed">
                      {selectedFabric.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Số lượng</label>
                      <p className="text-xl font-bold text-green-400 bg-green-900/30 rounded-2xl p-4 border border-green-700/40">
                        {selectedFabric.quantity} {selectedFabric.unit}
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Loại</label>
                      <p className="text-white bg-gray-800/70 rounded-2xl p-4 border border-gray-700/50">
                        {selectedFabric.type || 'Chính'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Vị trí kho</label>
                    <p className="text-white bg-gray-800/70 rounded-2xl p-4 border border-gray-700/50 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      {selectedFabric.location}
                    </p>
                  </div>

                  {selectedFabric.note && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Ghi chú</label>
                      <p className="text-yellow-300 bg-yellow-900/30 border border-yellow-700/40 rounded-2xl p-4">
                        {selectedFabric.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => {
                      setUploadingForId(selectedFabric.id);
                      setShowUploadModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 flex items-center justify-center gap-3 hover:scale-105"
                  >
                    <Camera className="w-5 h-5" />
                    {selectedFabric.image ? 'Đổi ảnh' : 'Thêm ảnh'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricInventoryApp;