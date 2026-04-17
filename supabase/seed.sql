SET session_replication_role = replica;

DO $$
DECLARE
  dev_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  col_1 UUID;
  col_2 UUID;
  col_3 UUID;
  content_1 UUID;
  content_2 UUID;
  content_3 UUID;
  content_4 UUID;
  content_5 UUID;
BEGIN
  DELETE FROM public.comments;
  DELETE FROM public.content_versions;
  DELETE FROM public.content;
  DELETE FROM public.videos;
  DELETE FROM public.collections;
  DELETE FROM public.users;
  DELETE FROM auth.users WHERE id = dev_user_id;

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    dev_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'dev@peaklearn.local',
    crypt('password123', gen_salt('bf')),
    NOW(), NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data, created_at, updated_at
  ) VALUES (
    dev_user_id, dev_user_id, dev_user_id, 'email',
    jsonb_build_object('sub', dev_user_id, 'email', 'dev@peaklearn.local', 'email_verified', true),
    NOW(), NOW()
  );

  INSERT INTO public.users (id, email, role) VALUES
    (dev_user_id, 'dev@peaklearn.local', 'owner');

  INSERT INTO public.collections (id, title, description, user_id) VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Knee Surgery Techniques', 'Video collection covering ACL reconstruction, meniscus repair, and total knee arthroplasty techniques', dev_user_id),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Shoulder Rehabilitation', 'Rehabilitation protocols and exercise demonstrations for post-operative shoulder patients', dev_user_id),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Orthopedic Research Summaries', 'Key research papers and meta-analyses explained in video format', dev_user_id),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'Hip Rehabilitation', 'Hip exercise and rehabilitation protocols from Siriraj Sports Medicine', dev_user_id);

  col_1 := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01';
  col_2 := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02';
  col_3 := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03';

  INSERT INTO public.videos (youtube_url, title, description, thumbnail_url, duration, tags, collection_id, user_id) VALUES
    ('https://www.youtube.com/watch?v=k8PykIrPn2E', 'Hip Exercise — การบริหารกล้ามเนื้อรอบสะโพก', 'Siriraj Sports Medicine demonstrates hip rehabilitation exercises for peri-articular hip muscles, including gluteus medius, gluteus maximus, and hip flexor strengthening protocols', 'https://i.ytimg.com/vi/k8PykIrPn2E/hqdefault.jpg', 300, ARRAY['hip', 'rehab', 'exercise', 'siriraj', 'gluteus'], 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', dev_user_id),
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'ACL Reconstruction Step-by-Step', 'Detailed walkthrough of anterior cruciate ligament reconstruction using hamstring autograft', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 1820, ARRAY['ACL', 'surgery', 'knee', 'technique'], col_1, dev_user_id),
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Meniscus Repair: Inside-Out Technique', 'Surgical demonstration of inside-out meniscus repair with proper suture placement', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 2400, ARRAY['meniscus', 'repair', 'knee', 'arthroscopy'], col_1, dev_user_id),
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Total Knee Arthroplasty Overview', 'Complete guide to TKA from patient assessment to post-operative care', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 3600, ARRAY['TKA', 'arthroplasty', 'knee', 'replacement'], col_1, dev_user_id),
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Rotator Cuff Repair Post-Op Protocol', 'Week-by-week rehabilitation protocol following rotator cuff repair surgery', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 1500, ARRAY['rotator-cuff', 'rehab', 'shoulder', 'post-op'], col_2, dev_user_id),
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Shoulder Impingement Exercises', 'Evidence-based exercise program for subacromial impingement syndrome', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 1200, ARRAY['impingement', 'exercises', 'shoulder', 'rehab'], col_2, dev_user_id),
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '2024 Meta-Analysis: PRP vs Steroid for Knee OA', 'Summary of latest meta-analysis comparing platelet-rich plasma to corticosteroid injections', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 900, ARRAY['PRP', 'research', 'knee', 'OA'], col_3, dev_user_id),
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'BJJ Study: Biologics in Tendon Healing', 'Review of 2024 British Journal study on biological augmentation for tendon repair', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 1100, ARRAY['biologics', 'tendon', 'research', 'healing'], col_3, dev_user_id);

  INSERT INTO public.content (id, title, body, tags, is_published, created_by, updated_at) VALUES
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
     'ACL Reconstruction Clinical Notes',
     '{
       "type": "doc",
       "content": [{
         "type": "paragraph",
         "content": [{"type": "text", "text": "Anterior Cruciate Ligament (ACL) Reconstruction — Clinical Summary", "marks": [{"type": "bold"}]}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Graft Options:"}]
       }, {
         "type": "bulletList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Bone-Patellar Tendon-Bone (BPTB) — gold standard for athletes, strong initial fixation"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Hamstring Autograft (4-strand ST/G) — less donor site morbidity, good outcomes"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Allograft — reduced morbidity, higher rerupture rate in young patients"}]}]}
         ]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Key Surgical Steps:", "marks": [{"type": "bold"}]}]
       }, {
         "type": "orderedList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Diagnostic arthroscopy — assess meniscus and chondral damage"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Graft harvest and preparation on back table"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Tunnel placement — femoral tunnel at 10 o''clock (right knee), tibial tunnel using tibial guide"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Graft passage and fixation (interference screws or suspensory buttons)"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Final arthroscopic evaluation and wound closure"}]}]}
         ]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Rehabilitation Timeline:", "marks": [{"type": "bold"}]}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Week 0-2: Brace locked in extension, quad sets, SLR, toe touch weight bearing. Week 2-6: Progressive ROM, closed-chain exercises, brace unlocked. Week 6-12: Open-chain exercises, jogging progression. Month 4-6: Sport-specific drills, agility training. Month 6-9: Return to pivoting sports with clearance."}]
       }]
     }'::jsonb,
     ARRAY['ACL', 'surgery', 'knee', 'clinical-notes'], true, dev_user_id, NOW() - interval '5 days'),

    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
     'Osteoarthritis Management Protocol',
     '{
       "type": "doc",
       "content": [{
         "type": "paragraph",
         "content": [{"type": "text", "text": "Knee Osteoarthritis — Stepwise Management Approach", "marks": [{"type": "bold"}]}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Conservative Management"}]
       }, {
         "type": "bulletList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Weight management (target BMI < 30)"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Physical therapy — quadriceps strengthening, low-impact aerobic conditioning"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "NSAIDs (topical first-line, oral if inadequate) — monitor renal/GI risk"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Assistive devices — cane (contralateral hand), unloader brace for valgus/varus"}]}]}
         ]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Injection Therapy"}]
       }, {
         "type": "bulletList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Corticosteroid injection — rapid relief, repeat q3 months max, monitor cartilage"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Hyaluronic acid (HA) — variable evidence, consider for mild-moderate OA"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "PRP (Leukocyte-poor) — emerging evidence, superior to HA in recent meta-analyses"}]}]}
         ]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Surgical Options"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Arthroscopy (debridement) — limited role, mainly for mechanical symptoms. High Tibial Osteotomy (HTO) — young patients with unicompartmental OA and correctable deformity. Unicompartmental Knee Replacement (UKR) — isolated medial/lateral compartment disease. Total Knee Arthroplasty (TKA) — end-stage OA, significant pain and functional limitation."}]
       }]
     }'::jsonb,
     ARRAY['OA', 'knee', 'protocol', 'management'], true, dev_user_id, NOW() - interval '3 days'),

    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
     'Fracture Classification Quick Reference',
     '{
       "type": "doc",
       "content": [{
         "type": "paragraph",
         "content": [{"type": "text", "text": "Common Fracture Classifications — Quick Reference", "marks": [{"type": "bold"}]}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "AO/OTA Classification (Long Bones)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Type A — Simple (extra-articular, simple fracture pattern). Type B — Wedge (extra-articular, wedge fragment). Type C — Complex (articular involvement, comminuted)."}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Neer Classification (Proximal Humerus)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Based on 4 segments: Greater tuberosity, Lesser tuberosity, Articular segment, Shaft. Displaced if >1cm translation or >45° angulation. Parts: 1-part (minimally displaced), 2-part, 3-part, 4-part. Valgus impacted 4-part has better prognosis than classic 4-part."}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Garden Classification (Femoral Neck)"}]
       }, {
         "type": "orderedList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Stage I — Incomplete, valgus impaction"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Stage II — Complete, non-displaced"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Stage III — Complete, partially displaced"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Stage IV — Complete, fully displaced"}]}]}
         ]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Weber Classification (Ankle)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Type A — Below syndesmosis (avulsion of medial malleolus common). Type B — At syndesmosis level (spiral fibula fracture). Type C — Above syndesmosis (syndesmotic injury, Maisonneuve variant)."}]
       }]
     }'::jsonb,
     ARRAY['fracture', 'classification', 'reference', 'AO'], true, dev_user_id, NOW() - interval '2 days'),

    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04',
     'Rotator Cuff Tear: Assessment & Treatment',
     '{
       "type": "doc",
       "content": [{
         "type": "paragraph",
         "content": [{"type": "text", "text": "Rotator Cuff Tears — Clinical Assessment & Treatment Algorithm", "marks": [{"type": "bold"}]}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Clinical Examination"}]
       }, {
         "type": "bulletList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Jobe test (empty can) — supraspinatus, sensitivity 0.77"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Lift-off test — subscapularis"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "External rotation lag sign — infraspinatus, highly specific"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Drop arm test — large/full-thickness tear"}]}]}
         ]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Imaging"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "X-ray: AP, outlet, axillary views — assess acromion morphology (Bigliani type I-III), AC joint arthrosis, humeral head position. MRI: Gold standard — assess tear size, retraction (Patte classification), fatty infiltration (Goutallier), muscle atrophy. Ultrasound: Dynamic assessment, cost-effective for follow-up."}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Treatment Decision"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Partial thickness (<50%): Debridement vs repair based on location and patient demands. Full thickness (small-medium): Arthroscopic repair, single-row vs double-row based on tear pattern. Massive retracted: Consider repair with margin convergence, partial repair, or reverse total shoulder arthroplasty in elderly patients."}]
       }]
     }'::jsonb,
     ARRAY['rotator-cuff', 'shoulder', 'assessment', 'treatment'], true, dev_user_id, NOW() - interval '1 day'),

    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c05',
     'Orthopedic Implant Materials Study Notes',
     '{
       "type": "doc",
       "content": [{
         "type": "paragraph",
         "content": [{"type": "text", "text": "Orthopedic Implant Materials — Study Notes", "marks": [{"type": "bold"}]}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Stainless Steel (316L)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Cost-effective, good strength, adequate corrosion resistance. Used in: plates, screws, intramedullary nails. Disadvantage: higher modulus than bone → stress shielding, potential allergic reaction (nickel)."}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Titanium (Ti-6Al-4V)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Excellent biocompatibility, lower modulus (closer to bone), osseointegration capability. Used in: joint replacements, spinal implants, dental implants. Grades: Commercially pure (Gr 1-4) for osseointegration, Ti-6Al-4V alloy for structural components."}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Cobalt-Chromium (Co-Cr)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Superior wear resistance, high strength. Used in: femoral heads, tibial trays, bearing surfaces. MoM (Metal-on-Metal) largely abandoned due to metallosis and ALTR (adverse local tissue reaction). CoC (Ceramic-on-Ceramic) or CoP (Ceramic-on-Polyethylene) preferred."}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Polyethylene (UHMWPE / HXPE)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Bearing surface in joint replacements. UHMWPE: conventional, wear particles → osteolysis. Highly cross-linked (HXPE): improved wear resistance, slightly reduced mechanical strength. Vitamin E stabilized: antioxidant, reduces oxidative degradation. XLPE reduces wear by 50-90% compared to conventional PE."}]
       }]
     }'::jsonb,
      ARRAY['implants', 'materials', 'biomaterials', 'study-notes'], false, dev_user_id, NOW()),

    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c06',
     'Hip Rehabilitation Protocol — Post-Operative Exercises',
     '{
       "type": "doc",
       "content": [{
         "type": "paragraph",
         "content": [{"type": "text", "text": "Hip Rehabilitation Protocol — Post-Operative Exercise Guide", "marks": [{"type": "bold"}]}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Phase 1: Immediate Post-Op (Week 0-2)"}]
       }, {
         "type": "bulletList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Ankle pumps — promote circulation, prevent DVT"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Quad sets — isometric contraction, 10x10 second holds"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Gluteal sets — squeeze and hold 5 seconds, 20 reps"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Heel slides — gentle hip flexion within pain-free range"}]}]}
         ]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Phase 2: Early Rehabilitation (Week 2-6)"}]
       }, {
         "type": "bulletList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Standing hip flexion — march in place, controlled movement"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Standing hip abduction — side-lying or standing, target gluteus medius"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Hip extension — prone or standing, activate gluteus maximus"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Clamshells with resistance band — 3 sets of 15, focus on controlled movement"}]}]}
         ]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Phase 3: Strengthening (Week 6-12)"}]
       }, {
         "type": "paragraph",
         "content": [{"type": "text", "text": "Progressive resistance exercises, mini-squats, step-ups, single-leg balance training. Reference video: Siriraj Sports Medicine hip exercise demonstration for proper technique and muscle activation patterns."}]
       }, {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Key Muscles to Target"}]
       }, {
         "type": "orderedList",
         "content": [
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Gluteus medius — hip abduction, pelvic stability"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Gluteus maximus — hip extension, stair climbing"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Iliopsoas — hip flexion, sit-to-stand"}]}]},
           {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Piriformis — external rotation, hip stability"}]}]}
         ]
       }]
     }'::jsonb,
     ARRAY['hip', 'rehab', 'exercise', 'post-op', 'siriraj'], true, dev_user_id, NOW());

  content_1 := 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01';
  content_2 := 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02';
  content_4 := 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c04';

  INSERT INTO public.content_versions (content_id, body, version_number) VALUES
    (content_1, '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Initial draft of ACL reconstruction notes"}]}]}'::jsonb, 1),
    (content_1, '{
      "type": "doc",
      "content": [{"type": "paragraph", "content": [{"type": "text", "text": "ACL Reconstruction — Draft with graft options and surgical steps", "marks": [{"type": "bold"}]}]}]
    }'::jsonb, 2),
    (content_2, '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"OA management outline — conservative options only"}]}]}'::jsonb, 1),
    (content_4, '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Rotator cuff assessment notes — examination section only"}]}]}'::jsonb, 1);

  INSERT INTO public.comments (content_id, body, created_by) VALUES
    (content_1, 'Remember to update the rehabilitation timeline based on the latest JBJS protocol changes for 2024.', dev_user_id),
    (content_1, 'Add a section on return-to-sport testing criteria ( hop tests, KT-1000, quad index ).', dev_user_id),
    (content_2, 'Consider adding PRP contraindications — active infection, bleeding disorder, pregnancy.', dev_user_id),
    (content_3, 'Include Danis-Weber vs Lauge-Hansen correlation for ankle fractures.', dev_user_id),
    (content_4, 'Great notes! Maybe add a section on post-operative sling protocols — typically 4-6 weeks in abduction pillow.', dev_user_id);
END $$;

SET session_replication_role = origin;
