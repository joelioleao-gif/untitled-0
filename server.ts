import express from 'express';
import { createServer as createViteServer } from 'vite';
import { BigQuery } from '@google-cloud/bigquery';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Lazy BigQuery initialization
let bigqueryClient: BigQuery | null = null;

function getBigQuery() {
  // TODO: remove this line when BigQuery integration is ready
  return null;

  if (!bigqueryClient) {
    const projectId = process.env.BIGQUERY_PROJECT_ID;
    if (!projectId) {
      console.warn('BIGQUERY_PROJECT_ID not set. BigQuery integration will be disabled.');
      return null;
    }
    
    // Check for credentials
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
      console.warn('No Google Cloud credentials found. BigQuery might fail if not running in a GCP environment.');
    }

    const credentialsJson = process.env.BIGQUERY_CREDENTIALS_JSON;
    let credentials;
    if (credentialsJson) {
      try {
        const parsed = JSON.parse(credentialsJson);
        // Handle Fury-style credentials where the actual key is in data.key_data (base64)
        if (parsed.data && parsed.data.key_data) {
          const decodedKey = Buffer.from(parsed.data.key_data, 'base64').toString('utf-8');
          credentials = JSON.parse(decodedKey);
        } else {
          credentials = parsed;
        }
      } catch (e) {
        console.error('Failed to parse BIGQUERY_CREDENTIALS_JSON', e);
      }
    }

    console.log(`Initializing BigQuery with Project ID: ${projectId}`);
    if (credentials) {
      console.log('BigQuery credentials found and parsed.');
    } else {
      console.warn('No custom BigQuery credentials provided, falling back to environment defaults.');
    }

    bigqueryClient = new BigQuery({ 
      projectId,
      location: process.env.BIGQUERY_LOCATION || undefined,
      credentials
    });
  }
  return bigqueryClient;
}

const DATASET_ID = process.env.BIGQUERY_DATASET_ID || 'alfred_workflow';
const TABLE_ID = process.env.BIGQUERY_TABLE_ID || 'investments';

// Ensure BigQuery Table exists
async function ensureTable() {
  const bq = getBigQuery();
  if (!bq) return;

  try {
    const dataset = bq.dataset(DATASET_ID);
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      await dataset.create();
      console.log(`Dataset ${DATASET_ID} created.`);
    }

    const table = dataset.table(TABLE_ID);
    const [tableExists] = await table.exists();
    if (!tableExists) {
      const schema = [
        { name: 'id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'title', type: 'STRING', mode: 'REQUIRED' },
        { name: 'description', type: 'STRING' },
        { name: 'amount', type: 'FLOAT', mode: 'REQUIRED' },
        { name: 'category', type: 'STRING' },
        { name: 'subCategory', type: 'STRING' },
        { name: 'site', type: 'STRING' },
        { name: 'pickingType', type: 'STRING' },
        { name: 'executingTeam', type: 'STRING' },
        { name: 'requester_name', type: 'STRING' },
        { name: 'requester_email', type: 'STRING' },
        { name: 'status', type: 'STRING', mode: 'REQUIRED' },
        { name: 'inPlan', type: 'BOOLEAN' },
        { name: 'createdAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'updatedAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'approver_name', type: 'STRING' },
        { name: 'approver_email', type: 'STRING' },
        { name: 'comments', type: 'STRING' },
      ];
      await table.create({ schema });
      console.log(`Table ${TABLE_ID} created.`);
    }
  } catch (error) {
    console.error('Error ensuring BigQuery table:', error);
  }
}

ensureTable();

// API Routes
app.get('/api/requests', async (req, res) => {
  const bq = getBigQuery();
  if (!bq) {
    // Fallback to mock data if BQ not configured
    const mockRequests = [
      {
        id: '51201292',
        title: 'XD ML BRSPI-BRSXPI Proyecto y Mejora 222048',
        description: 'Proyecto de mejora operativa para el site BRSPI.',
        amount: 222048,
        category: 'Infraestructura',
        subCategory: '',
        site: 'BRSPI',
        pickingType: 'Mezzanine',
        executingTeam: 'Excelencia Ope',
        requester: { name: 'Joelio Leão', email: 'joelio.leao@mercadolivre.com' },
        status: 'pending',
        inPlan: true,
        createdAt: '2026-03-11T14:08:00Z',
        updatedAt: '2026-03-11T14:08:00Z'
      },
      {
        id: '51201160',
        title: 'SVC ML SSC7 Moving 84302',
        description: 'Mudança de infraestrutura SSC7.',
        amount: 84302,
        category: 'Software',
        subCategory: '',
        site: 'SSC7',
        pickingType: 'No incluye',
        executingTeam: 'Expansión',
        requester: { name: 'Joelio Leão', email: 'joelio.leao@mercadolivre.com' },
        status: 'approved',
        inPlan: false,
        createdAt: '2026-03-11T13:57:00Z',
        updatedAt: '2026-03-11T13:57:00Z'
      },
      {
        id: '51196142',
        title: 'FBM MLC CLRM20 Infraestructura 19000',
        description: 'Infraestrutura para CLRM20.',
        amount: 19000,
        category: 'Infraestructura',
        subCategory: '',
        site: 'CLRM20',
        pickingType: 'Pallet Inbound',
        executingTeam: 'Plant Eng',
        requester: { name: 'Joelio Leão', email: 'joelio.leao@mercadolivre.com' },
        status: 'pending',
        inPlan: true,
        createdAt: '2026-03-11T11:20:00Z',
        updatedAt: '2026-03-11T11:20:00Z'
      },
      {
        id: '51195279',
        title: 'XD MLC CLRM11 Proyecto y Mejora 45520',
        description: 'Mejoras en el site CLRM11.',
        amount: 45520,
        category: 'Marketing',
        subCategory: '',
        site: 'CLRM11',
        pickingType: 'Mezzanine',
        executingTeam: 'Excelencia Ope',
        requester: { name: 'Joelio Leão', email: 'joelio.leao@mercadolivre.com' },
        status: 'rejected',
        inPlan: false,
        createdAt: '2026-03-11T11:22:00Z',
        updatedAt: '2026-03-11T11:22:00Z'
      }
    ];
    // Generate more mock data to test pagination
    for (let i = 5; i <= 25; i++) {
      mockRequests.push({
        id: `5119${5279 + i}`,
        title: `Proyecto de Expansión ${i}`,
        description: `Descripción del proyecto ${i}`,
        amount: 10000 + (i * 1000),
        category: i % 2 === 0 ? 'Infraestructura' : 'Software',
        subCategory: '',
        site: `SITE-${i}`,
        pickingType: 'Standard',
        executingTeam: 'Equipo A',
        requester: { name: 'Joelio Leão', email: 'joelio.leao@mercadolivre.com' },
        status: i % 3 === 0 ? 'approved' : 'pending',
        inPlan: i % 2 === 0,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - i * 3600000).toISOString()
      });
    }
    return res.json(mockRequests);
  }

  try {
    const query = `SELECT * FROM \`${process.env.BIGQUERY_PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\` ORDER BY createdAt DESC`;
    const [rows] = await bq.query({
      query,
      location: process.env.BIGQUERY_LOCATION || undefined
    });
    
    // Map BQ rows back to our frontend type
    const requests = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: row.amount,
      category: row.category,
      subCategory: row.subCategory || '',
      site: row.site,
      pickingType: row.pickingType,
      executingTeam: row.executingTeam,
      requester: { name: row.requester_name, email: row.requester_email },
      status: row.status,
      inPlan: row.inPlan || false,
      createdAt: row.createdAt.value,
      updatedAt: row.updatedAt.value,
      approver: row.approver_name ? { name: row.approver_name, email: row.approver_email } : undefined,
      comments: row.comments
    }));
    
    res.json(requests);
  } catch (error: any) {
    console.error('Error fetching from BigQuery:', error);
    res.status(500).json({ 
      error: 'Failed to fetch requests',
      details: error.message,
      code: error.code
    });
  }
});

app.post('/api/requests', async (req, res) => {
  const bq = getBigQuery();
  if (!bq) return res.status(500).json({ error: 'BigQuery not configured' });

  const { id, title, description, amount, category, subCategory, site, pickingType, executingTeam, requester, status, inPlan, createdAt, updatedAt, approver, comments } = req.body;

  try {
    const table = bq.dataset(DATASET_ID).table(TABLE_ID);
    await table.insert({
      id,
      title,
      description,
      amount,
      category,
      subCategory,
      site,
      pickingType,
      executingTeam,
      requester_name: requester.name,
      requester_email: requester.email,
      status,
      inPlan,
      approver_name: approver?.name || null,
      approver_email: approver?.email || null,
      comments: comments || null,
      createdAt: BigQuery.timestamp(createdAt),
      updatedAt: BigQuery.timestamp(updatedAt),
    });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error inserting into BigQuery:', error);
    res.status(500).json({ error: 'Failed to save request' });
  }
});

app.patch('/api/requests/:id', async (req, res) => {
  const bq = getBigQuery();
  if (!bq) return res.status(500).json({ error: 'BigQuery not configured' });

  const { id } = req.params;
  const { status, comments, approver, updatedAt } = req.body;

  try {
    // BigQuery doesn't support easy single-row updates like SQL. 
    // Usually, we'd use DML (UPDATE statement).
    const query = `
      UPDATE \`${process.env.BIGQUERY_PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
      SET status = @status, 
          comments = @comments, 
          approver_name = @approver_name, 
          approver_email = @approver_email, 
          updatedAt = TIMESTAMP(@updatedAt)
      WHERE id = @id
    `;
    
    const options = {
      query,
      location: process.env.BIGQUERY_LOCATION || undefined,
      params: {
        status,
        comments: comments || null,
        approver_name: approver?.name || null,
        approver_email: approver?.email || null,
        updatedAt,
        id
      }
    };

    await bq.query(options);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating BigQuery:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

app.get('/api/picking-types', async (req, res) => {
  const bq = getBigQuery();
  if (!bq) {
    return res.json(['FBM', 'XD', 'SC', 'SVC', 'AIR']);
  }

  try {
    const query = `SELECT DISTINCT PICKING_TYPE FROM \`meli-sbox.CAPEXMGT.TEMP_FC_OI_PT_2\` ORDER BY PICKING_TYPE ASC`;
    const [rows] = await bq.query({
      query,
      location: process.env.BIGQUERY_LOCATION || undefined
    });
    const pickingTypes = rows.map(row => row.PICKING_TYPE).filter(Boolean);
    res.json(pickingTypes);
  } catch (error: any) {
    console.warn('Error fetching picking types from BigQuery, using fallback:', error.message);
    res.json(['FBM', 'XD', 'SC', 'SVC', 'AIR']);
  }
});

app.get('/api/executing-teams', async (req, res) => {
  const bq = getBigQuery();
  const fallbackTeams = ['INGENIERIA', 'D&C', 'PLANT ENG.', 'START UP', 'S&OP', 'PROCESS IMP.', 'EXCELÊNCIA OPE.', 'INTERNAL SYSTEM', 'SHE', 'EXPANSIÓN', 'MELI AIR', 'LOSS PREVENTION'];

  if (!bq) {
    return res.json(fallbackTeams);
  }

  try {
    const query = `SELECT DISTINCT EQUIPO FROM \`meli-sbox.CAPEXMGT.TEMP_CADASTRO_TIPOS_PROYECTOS\` ORDER BY EQUIPO ASC`;
    const [rows] = await bq.query({
      query,
      location: process.env.BIGQUERY_LOCATION || undefined
    });
    const teams = rows.map(row => row.EQUIPO).filter(Boolean);
    res.json(teams);
  } catch (error: any) {
    console.warn('Error fetching executing teams from BigQuery, using fallback:', error.message);
    res.json(fallbackTeams);
  }
});

app.get('/api/categories', async (req, res) => {
  const team = req.query.team as string | undefined;

  const fallbackMap: Record<string, string[]> = {
    'INGENIERIA':       ['ALMACENAMIENTO', 'AUT. Y MEC.', 'ROBÓTICA'],
    'D&C':              ['ALMACENAMIENTO', 'INFRAESTRUCTURA', 'OFFICE Y AREAS APOYO', 'PMOS Y CMOS'],
    'PLANT ENG.':       ['ALMACENAMIENTO', 'EQUIPAMIENTOS', 'FACILITIES', 'INFRAESTRUCTURA'],
    'START UP':         ['EQUIPAMIENTO OP', 'PMOS Y CMOS'],
    'S&OP':             ['EQUIPAMIENTO OP'],
    'PROCESS IMP.':     ['PROYECTO Y MEJORA'],
    'EXCELÊNCIA OPE.':  ['PROYECTO Y MEJORA'],
    'INTERNAL SYSTEM':  ['ALMACENAMIENTO', 'HARDWARE&OTHERS', 'INFRAESTRUCTURA', 'SEGURIDAD ELECT.'],
    'SHE':              ['ALMACENAMIENTO', 'INFRAESTRUCTURA', 'SAFETY'],
    'EXPANSIÓN':        ['EQUIPAMIENTO OP', 'INFRAESTRUCTURA', 'PMOS Y CMOS'],
    'MELI AIR':         ['EQUIPAMIENTO OP', 'INFRAESTRUCTURA'],
    'LOSS PREVENTION':  ['SEGURIDAD'],
  };

  const getFallback = () => {
    if (team && fallbackMap[team]) return fallbackMap[team];
    return [...new Set(Object.values(fallbackMap).flat())].sort();
  };

  const bq = getBigQuery();
  if (!bq) return res.json(getFallback());

  try {
    let query = `SELECT DISTINCT CATEGORIA FROM \`meli-sbox.CAPEXMGT.TEMP_CADASTRO_TIPOS_PROYECTOS\``;
    const params: Record<string, string> = {};
    if (team) {
      query += ` WHERE EQUIPO = @team`;
      params.team = team;
    }
    query += ` ORDER BY CATEGORIA ASC`;

    const [rows] = await bq.query({
      query,
      params,
      location: process.env.BIGQUERY_LOCATION || undefined
    });
    const cats = rows.map(row => row.CATEGORIA).filter(Boolean);
    res.json(cats);
  } catch (error: any) {
    console.warn('Error fetching categories from BigQuery, using fallback:', error.message);
    res.json(getFallback());
  }
});

app.get('/api/subcategories', async (req, res) => {
  const team = req.query.team as string | undefined;
  const category = req.query.category as string | undefined;

  const fallbackMap: Record<string, Record<string, string[]>> = {
    'INGENIERIA': {
      'ALMACENAMIENTO':  ['MEZZANINE', 'RACK', 'REGULAR SHELF', 'HS + VNA', 'CAJONERAS'],
      'AUT. Y MEC.':     ['AUTOMACIÓN', 'MECANIZACIÓN', 'SORTER'],
      'ROBÓTICA':        ['PACKING MACHINE', 'GTPS', 'AMRS/AGVS', 'PTWC', 'OTHERS ROBOTICS'],
    },
    'D&C': {
      'ALMACENAMIENTO':      ['INTERIORISMO D&C'],
      'INFRAESTRUCTURA':     ['CONFORT TÉRMICO', 'PPCI', 'INFRAESTRUCTURA D&C', 'TENANT IMPROVEMENTS'],
      'PMOS Y CMOS':         ['PMOS Y CMOS D&C', 'PMOS Y CMOS REC'],
      'OFFICE Y AREAS APOYO':['COCINA', 'MOBILIARIO', 'OBRA CIVIL'],
    },
    'PLANT ENG.': {
      'FACILITIES':      ['UTILITIES&FACILITIES'],
      'INFRAESTRUCTURA': ['CARGADORES ELEC', 'USINAS&GENERADORES', 'INFRAESTRUCTURA PE'],
      'EQUIPAMIENTOS':   ['EQUIPAMIENTOS PE'],
      'ALMACENAMIENTO':  ['INTERIORISMO PE'],
    },
    'START UP': {
      'EQUIPAMIENTO OP': ['CARROS Y JAULAS', 'PUESTOS DE TRABAJO', 'MANGA PALLETS', 'TOTES', 'PALLETS PLÁSTICO', 'MHES', 'OTHERS EQUIP.'],
      'PMOS Y CMOS':     ['PMOS Y CMOS'],
    },
    'S&OP': {
      'EQUIPAMIENTO OP': ['CARROS Y JAULAS', 'PUESTOS DE TRABAJO', 'MANGA PALLETS', 'TOTES', 'PALLETS PLÁSTICO', 'MHES', 'OTHERS EQUIP.'],
    },
    'PROCESS IMP.': {
      'PROYECTO Y MEJORA': ['EQUIPAMIENTOS CIE', 'BINFULNESS', 'TRAINING'],
    },
    'EXCELÊNCIA OPE.': {
      'PROYECTO Y MEJORA': ['EQUIPAMIENTO OPE', 'OTROS PROYECTOS', 'MANGA PALLETS'],
    },
    'INTERNAL SYSTEM': {
      'ALMACENAMIENTO':   ['INTERIORISMO IS'],
      'INFRAESTRUCTURA':  ['CABLEADO', 'NETWORKING'],
      'SEGURIDAD ELECT.': ['SEGURIDAD ELECT.'],
      'HARDWARE&OTHERS':  ['HANDHELDS & SCANNERS', 'NOTEBOOK & MONITORES', 'MULTIMEDIA', 'PRINTERS', 'OTHERS HARDWARES'],
    },
    'SHE': {
      'ALMACENAMIENTO':  ['INTERIORISMO SHE'],
      'INFRAESTRUCTURA': ['ACCES&ERGONOMIA', 'DOCAS', 'INFRAESTRUCTURA SHE'],
      'SAFETY':          ['OTROS PROYECTOS'],
    },
    'EXPANSIÓN': {
      'INFRAESTRUCTURA':  ['INFRAESTRUCTURA EXP', 'CARGADORES ELEC', 'OBRA OPERACIONAL'],
      'EQUIPAMIENTO OP':  ['CARROS', 'FLOW RACK&OTHERS'],
      'PMOS Y CMOS':      ['PMO Y CMO EXP'],
    },
    'MELI AIR': {
      'INFRAESTRUCTURA':  ['INFRAESTRUCTURA AIR'],
      'EQUIPAMIENTO OP':  ['RACKS AEREOS', 'CARROS Y OTHERS'],
    },
    'LOSS PREVENTION': {
      'SEGURIDAD': ['CONTROL EXTERNO', 'CONTROL INTERNO'],
    },
  };

  const getFallback = () => {
    if (team && category && fallbackMap[team]?.[category]) return fallbackMap[team][category];
    if (team && fallbackMap[team]) return [...new Set(Object.values(fallbackMap[team]).flat())].sort();
    return [...new Set(Object.values(fallbackMap).flatMap(t => Object.values(t).flat()))].sort();
  };

  const bq = getBigQuery();
  if (!bq) return res.json(getFallback());

  try {
    let query = `SELECT DISTINCT SUBCATEGORIA FROM \`meli-sbox.CAPEXMGT.TEMP_CADASTRO_TIPOS_PROYECTOS\``;
    const params: Record<string, string> = {};
    const conditions: string[] = [];
    if (team) { conditions.push('EQUIPO = @team'); params.team = team; }
    if (category) { conditions.push('CATEGORIA = @category'); params.category = category; }
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY SUBCATEGORIA ASC`;

    const [rows] = await bq.query({ query, params, location: process.env.BIGQUERY_LOCATION || undefined });
    const subcats = rows.map(row => row.SUBCATEGORIA).filter(Boolean);
    res.json(subcats);
  } catch (error: any) {
    console.warn('Error fetching subcategories from BigQuery, using fallback:', error.message);
    res.json(getFallback());
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static('dist'));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
