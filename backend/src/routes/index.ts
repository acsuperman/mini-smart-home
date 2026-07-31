import express from 'express';
import cloudSideLogin from '@/services/cloudSideLogin';
import getFamily from '@/services/getFamily';
import getFamilyThing from '@/services/getFamilyThing';
import integrateDevice from '@/services/integrateDevice';
import disIntegrateDevice from '@/services/disIntegrateDevice';
import getOpenToken from '@/services/getOpenToken';
import shutoffCloudSideConnect from '@/services/shutoffCloudSideConnect';

const router = express.Router();

// ================================frontend=========================================
router.post('/cloudSideConnect', cloudSideLogin);
router.post('/shutoffCloudSideConnect',shutoffCloudSideConnect);
router.get('/v2/family', getFamily);
router.get('/v2/device/thing', getFamilyThing);
router.post('/devices/integrate', integrateDevice);
router.delete('/devices/integrate',disIntegrateDevice);
router.get('/openToken',getOpenToken);

export default router;
