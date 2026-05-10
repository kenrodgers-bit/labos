export const MOH_REPORT_CATEGORIES = [
  {
    key: 'urine_analysis',
    title: 'Urine Analysis',
    accent: '#2563eb',
    columns: [
      { key: 'totalTests', label: 'Total tests', role: 'workload' },
      { key: 'abnormalFindings', label: 'Abnormal findings', role: 'positive' }
    ],
    tests: [
      ['urine_chemistry', 'Urine chemistry', 'Urine chemistry'],
      ['glucose', 'Glucose', 'Urine chemistry'],
      ['ketones', 'Ketones', 'Urine chemistry'],
      ['protein', 'Protein', 'Urine chemistry'],
      ['urine_microscopy', 'Urine microscopy', 'Urine microscopy'],
      ['pus_cells', 'Pus cells', 'Urine microscopy'],
      ['red_blood_cells', 'Red blood cells', 'Urine microscopy'],
      ['casts', 'Casts', 'Urine microscopy'],
      ['yeast_cells', 'Yeast cells', 'Urine microscopy'],
      ['trichomonads', 'Trichomonads', 'Urine microscopy']
    ]
  },
  {
    key: 'blood_chemistry',
    title: 'Blood Chemistry',
    accent: '#0f766e',
    columns: [
      { key: 'totalTests', label: 'Total tests', role: 'workload' },
      { key: 'low', label: 'Low', role: 'positive' },
      { key: 'high', label: 'High', role: 'positive' }
    ],
    tests: [
      ['blood_sugar', 'Blood sugar', 'Blood sugar test'],
      ['ogtt', 'Oral glucose tolerance test', 'Blood sugar test'],
      ['albumin', 'Albumin', 'Liver function tests'],
      ['globulin', 'Globulin', 'Liver function tests'],
      ['bilirubin', 'Bilirubin', 'Liver function tests'],
      ['total_protein', 'Total protein', 'Liver function tests'],
      ['alkaline_phosphatase', 'Alkaline phosphatase', 'Liver function tests'],
      ['ast_sgot', 'AST / SGOT', 'Liver function tests'],
      ['alt_sgpt', 'ALT / SGPT', 'Liver function tests'],
      ['urea', 'Urea', 'Renal function tests'],
      ['creatinine', 'Creatinine', 'Renal function tests'],
      ['uric_acid', 'Uric acid', 'Renal function tests'],
      ['sodium_potassium', 'Sodium / potassium', 'Renal function tests'],
      ['total_cholesterol', 'Total cholesterol', 'Lipid profile'],
      ['triglycerides', 'Triglycerides', 'Lipid profile'],
      ['hdl_cholesterol', 'HDL cholesterol', 'Lipid profile'],
      ['ldl_cholesterol', 'LDL cholesterol', 'Lipid profile'],
      ['psa', 'PSA', 'Tumour markers'],
      ['ca_125', 'CA-125', 'Tumour markers'],
      ['cea', 'CEA', 'Tumour markers'],
      ['cd4_count', 'CD4 count', 'CD4 chemistry']
    ]
  },
  {
    key: 'parasitology',
    title: 'Parasitology',
    accent: '#7c3aed',
    columns: [
      { key: 'totalTests', label: 'Total tests', role: 'workload' },
      { key: 'positive', label: 'Number positive', role: 'positive' }
    ],
    tests: [
      ['malaria_bs', 'Malaria blood slide', 'Malaria'],
      ['malaria_rdt', 'Malaria rapid diagnostic test', 'Malaria'],
      ['other_blood_parasites', 'Other blood parasites', 'Malaria'],
      ['stool_microscopy', 'Stool microscopy', 'Stool examination'],
      ['stool_occult_blood', 'Stool occult blood', 'Stool examination'],
      ['entamoeba_histolytica', 'Entamoeba histolytica', 'Stool parasites'],
      ['giardia_lamblia', 'Giardia lamblia', 'Stool parasites'],
      ['ascaris_lumbricoides', 'Ascaris lumbricoides', 'Stool parasites'],
      ['hookworm', 'Hookworm', 'Stool parasites'],
      ['schistosoma_mansoni', 'Schistosoma mansoni', 'Stool parasites'],
      ['other_intestinal_parasites', 'Other intestinal parasites', 'Stool parasites']
    ]
  },
  {
    key: 'haematology',
    title: 'Haematology',
    accent: '#dc2626',
    columns: [
      { key: 'totalTests', label: 'Total tests', role: 'workload' },
      { key: 'low', label: 'Low / abnormal', role: 'positive' },
      { key: 'critical', label: 'Critical result', role: 'positive' }
    ],
    tests: [
      ['full_blood_count', 'Full blood count', 'Haematology exams'],
      ['hb_estimation', 'Haemoglobin estimation', 'Haematology exams'],
      ['blood_film', 'Blood film morphology', 'Haematology exams'],
      ['esr', 'ESR', 'Other haematology tests'],
      ['bleeding_time', 'Bleeding time', 'Other haematology tests'],
      ['clotting_time', 'Clotting time', 'Other haematology tests'],
      ['coagulation_profile', 'Coagulation profile', 'Other haematology tests'],
      ['reticulocyte_count', 'Reticulocyte count', 'Other haematology tests'],
      ['blood_grouping', 'ABO/Rh blood grouping', 'Blood grouping'],
      ['cross_match', 'Cross matching', 'Blood grouping'],
      ['sickle_cell_screen', 'Sickle cell screening', 'Haemoglobinopathy'],
      ['g6pd_screen', 'G6PD screen', 'Haemoglobinopathy']
    ]
  },
  {
    key: 'bacteriology',
    title: 'Bacteriology',
    accent: '#0891b2',
    columns: [
      { key: 'totalExam', label: 'Total exam', role: 'workload' },
      { key: 'culturePositive', label: 'Culture positive', role: 'positive' },
      { key: 'noCulturePositive', label: 'No culture positive', role: 'positive' }
    ],
    tests: [
      ['urine_culture', 'Urine culture', 'Bacteriological samples'],
      ['pus_swab', 'Pus swab', 'Bacteriological samples'],
      ['high_vaginal_swab', 'High vaginal swab', 'Bacteriological samples'],
      ['throat_swab', 'Throat swab', 'Bacteriological samples'],
      ['blood_culture', 'Blood culture', 'Bacteriological samples'],
      ['stool_culture', 'Stool culture', 'Bacteriological samples'],
      ['csf_culture', 'CSF culture', 'Bacteriological samples'],
      ['vibrio_cholerae', 'Vibrio cholerae', 'Bacterial enteric pathogens'],
      ['shigella', 'Shigella species', 'Bacterial enteric pathogens'],
      ['salmonella_typhi', 'Salmonella typhi', 'Bacterial enteric pathogens'],
      ['non_typhi_salmonella', 'Non-typhi salmonella', 'Bacterial enteric pathogens'],
      ['e_coli_0157', 'E. coli O157:H7', 'Bacterial enteric pathogens'],
      ['streptococcus_pneumoniae', 'Streptococcus pneumoniae', 'Bacterial meningitis'],
      ['neisseria_meningitidis', 'Neisseria meningitidis', 'Bacterial meningitis'],
      ['haemophilus_influenzae', 'Haemophilus influenzae', 'Bacterial meningitis'],
      ['sputum_zn', 'Sputum ZN microscopy', 'Sputum'],
      ['tb_gene_xpert', 'TB GeneXpert', 'Sputum'],
      ['afb_culture', 'AFB culture', 'Sputum']
    ]
  },
  {
    key: 'histology_cytology',
    title: 'Histology & Cytology',
    accent: '#9333ea',
    columns: [
      { key: 'totalExam', label: 'Total exam', role: 'workload' },
      { key: 'malignant', label: 'Malignant', role: 'positive' }
    ],
    tests: [
      ['fnac', 'FNAC', 'Fine needle aspiration cytology'],
      ['fnac_suspicious', 'FNAC suspicious', 'Fine needle aspiration cytology'],
      ['tissue_specimens', 'Tissue specimens', 'Histology'],
      ['biopsy', 'Biopsy', 'Histology'],
      ['pap_smear', 'Pap smear', 'Cervical cytology'],
      ['cervical_cytology', 'Cervical cytology', 'Cervical cytology'],
      ['breast_cytology', 'Breast cytology', 'Cytology'],
      ['body_fluid_cytology', 'Body fluid cytology', 'Cytology'],
      ['bone_marrow', 'Bone marrow examination', 'Cytology'],
      ['cell_block', 'Cell block', 'Cytology'],
      ['sputum_cytology', 'Sputum cytology', 'Cytology'],
      ['other_histology', 'Other histology/cytology', 'Other']
    ]
  },
  {
    key: 'serology',
    title: 'Serology',
    accent: '#059669',
    columns: [
      { key: 'totalExam', label: 'Total exam', role: 'workload' },
      { key: 'numberPositive', label: 'Number positive', role: 'positive' }
    ],
    tests: [
      ['vdrl', 'VDRL', 'Serological test'],
      ['tpha', 'TPHA', 'Serological test'],
      ['aso_titre', 'ASO titre', 'Serological test'],
      ['rheumatoid_factor', 'Rheumatoid factor', 'Serological test'],
      ['hbsag', 'HBsAg', 'Serological test'],
      ['hcv_antibody', 'HCV antibody', 'Serological test'],
      ['hiv_screening', 'HIV screening test', 'Serological test'],
      ['pregnancy_test', 'Pregnancy test', 'Serological test'],
      ['crp', 'CRP', 'Serological test'],
      ['widal', 'Widal test', 'Serological test'],
      ['brucella', 'Brucella test', 'Serological test']
    ]
  },
  {
    key: 'specimen_referral',
    title: 'Specimen Referral',
    accent: '#f59e0b',
    columns: [
      { key: 'totalSpecimens', label: 'Specimen referred', role: 'workload' },
      { key: 'resultsReceived', label: 'Results received', role: 'positive' },
      { key: 'notReceived', label: 'Results not received', role: 'positive' }
    ],
    tests: [
      ['cd4', 'CD4', 'Specimen referral to higher levels'],
      ['viral_load', 'Viral load', 'Specimen referral to higher levels'],
      ['tb_culture', 'TB culture', 'Specimen referral to higher levels'],
      ['blood_culture_referral', 'Blood culture', 'Specimen referral to higher levels'],
      ['histology_referral', 'Histology', 'Specimen referral to higher levels'],
      ['cytology_referral', 'Cytology', 'Specimen referral to higher levels'],
      ['chemistry_referral', 'Chemistry', 'Specimen referral to higher levels'],
      ['haematology_referral', 'Haematology', 'Specimen referral to higher levels'],
      ['microbiology_referral', 'Microbiology', 'Specimen referral to higher levels']
    ]
  },
  {
    key: 'drug_susceptibility',
    title: 'Drug Susceptibility Testing',
    accent: '#0f172a',
    columns: [
      { key: 'ampicillinSensitive', label: 'Ampicillin S', role: 'workload' },
      { key: 'ampicillinResistant', label: 'Ampicillin R', role: 'resistant' },
      { key: 'chloramphenicolSensitive', label: 'Chloramphenicol S', role: 'workload' },
      { key: 'chloramphenicolResistant', label: 'Chloramphenicol R', role: 'resistant' },
      { key: 'ceftriaxoneSensitive', label: 'Ceftriaxone S', role: 'workload' },
      { key: 'ceftriaxoneResistant', label: 'Ceftriaxone R', role: 'resistant' },
      { key: 'penicillinSensitive', label: 'Penicillin S', role: 'workload' },
      { key: 'penicillinResistant', label: 'Penicillin R', role: 'resistant' },
      { key: 'oxacillinSensitive', label: 'Oxacillin S', role: 'workload' },
      { key: 'oxacillinResistant', label: 'Oxacillin R', role: 'resistant' },
      { key: 'ciprofloxacinSensitive', label: 'Ciprofloxacin S', role: 'workload' },
      { key: 'ciprofloxacinResistant', label: 'Ciprofloxacin R', role: 'resistant' },
      { key: 'nalidixicSensitive', label: 'Nalidixic acid S', role: 'workload' },
      { key: 'nalidixicResistant', label: 'Nalidixic acid R', role: 'resistant' },
      { key: 'cotrimoxazoleSensitive', label: 'Co-trimoxazole S', role: 'workload' },
      { key: 'cotrimoxazoleResistant', label: 'Co-trimoxazole R', role: 'resistant' },
      { key: 'tetracyclineSensitive', label: 'Tetracycline S', role: 'workload' },
      { key: 'tetracyclineResistant', label: 'Tetracycline R', role: 'resistant' },
      { key: 'augmentinSensitive', label: 'Augmentin S', role: 'workload' },
      { key: 'augmentinResistant', label: 'Augmentin R', role: 'resistant' }
    ],
    tests: [
      ['salmonella_typhi_dst', 'Salmonella typhi', 'Drug sensitivity pattern'],
      ['non_typhi_salmonella_dst', 'Non-typhi salmonella', 'Drug sensitivity pattern'],
      ['staphylococcus_aureus_dst', 'Staphylococcus aureus', 'Drug sensitivity pattern'],
      ['streptococcus_pneumoniae_dst', 'Streptococcus pneumoniae', 'Drug sensitivity pattern'],
      ['escherichia_coli_dst', 'Escherichia coli', 'Drug sensitivity pattern'],
      ['vibrio_cholerae_dst', 'Vibrio cholerae', 'Drug sensitivity pattern'],
      ['neisseria_meningitidis_dst', 'Neisseria meningitidis', 'Drug sensitivity pattern'],
      ['pseudomonas_dst', 'Pseudomonas species', 'Drug sensitivity pattern']
    ]
  }
];

function sampleValue(categoryIndex, testIndex, field) {
  const base = ((categoryIndex + 2) * (testIndex + 3)) % 29;
  if (field.role === 'workload') return base + 8;
  if (field.role === 'resistant') return Math.floor((base + testIndex) / 9);
  if (field.role === 'positive') return Math.floor((base + 3) / 5);
  return 0;
}

function readValue(values, key) {
  if (!values) return 0;
  if (typeof values.get === 'function') return values.get(key);
  return values[key];
}

export function createReportEntries({ seedSample = false } = {}) {
  return MOH_REPORT_CATEGORIES.flatMap((category, categoryIndex) => (
    category.tests.map(([testKey, testName, group], testIndex) => ({
      categoryKey: category.key,
      testKey,
      testName,
      group,
      values: Object.fromEntries(category.columns.map((field) => [
        field.key,
        seedSample ? sampleValue(categoryIndex, testIndex, field) : 0
      ]))
    }))
  ));
}

export function normalizeReportEntries(entries = []) {
  const incoming = new Map(entries.map((entry) => [`${entry.categoryKey}:${entry.testKey}`, entry]));
  return MOH_REPORT_CATEGORIES.flatMap((category) => (
    category.tests.map(([testKey, testName, group]) => {
      const current = incoming.get(`${category.key}:${testKey}`);
      const values = Object.fromEntries(category.columns.map((field) => {
        const raw = readValue(current?.values, field.key);
        const parsed = Number(raw);
        return [field.key, Number.isFinite(parsed) && parsed >= 0 ? parsed : 0];
      }));
      return { categoryKey: category.key, testKey, testName, group, values };
    })
  ));
}

export function calculateReportTotals(entries = []) {
  const entryMap = new Map(entries.map((entry) => [`${entry.categoryKey}:${entry.testKey}`, entry]));
  const categories = MOH_REPORT_CATEGORIES.map((category) => {
    const totals = category.columns.reduce((acc, field) => ({ ...acc, [field.key]: 0 }), {});
    let workload = 0;
    let positives = 0;
    let resistant = 0;

    category.tests.forEach(([testKey]) => {
      const entry = entryMap.get(`${category.key}:${testKey}`);
      category.columns.forEach((field) => {
        const value = Number(readValue(entry?.values, field.key) || 0);
        totals[field.key] += value;
        if (field.role === 'workload') workload += value;
        if (field.role === 'positive') positives += value;
        if (field.role === 'resistant') resistant += value;
      });
    });

    return { key: category.key, title: category.title, totals, workload, positives, resistant };
  });

  return {
    categories,
    workload: categories.reduce((sum, category) => sum + category.workload, 0),
    positives: categories.reduce((sum, category) => sum + category.positives, 0),
    resistant: categories.reduce((sum, category) => sum + category.resistant, 0)
  };
}
