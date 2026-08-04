import express from 'express';
import cloudSideLogin from '@/services/cloudSideLogin';
import getFamily from '@/services/getFamily';
import getFamilyThing from '@/services/getFamilyThing';
import integrateDevice from '@/services/integrateDevice';
import disIntegrateDevice from '@/services/disIntegrateDevice';
import getOpenToken from '@/services/getOpenToken';
import shutoffCloudSideConnect from '@/services/shutoffCloudSideConnect';
import sseBridge from '@/services/sseBridge';
import dealIhostDirective from '@/services/dealIhostDirective';
import updateDevice from '@/services/updateDevice';

const router = express.Router();

// ================================frontend=========================================
router.post('/cloudSideConnect', cloudSideLogin);
router.post('/shutoffCloudSideConnect',shutoffCloudSideConnect);
router.get('/v2/family', getFamily);
router.get('/v2/device/thing', getFamilyThing);
router.post('/devices/integrate', integrateDevice);
router.delete('/devices/integrate',disIntegrateDevice);
router.get('/openToken',getOpenToken);
router.get('/sse/bridge',sseBridge);
router.patch('/device/:deviceid',updateDevice);

// ================================iHost=========================================
router.post('/dealIhostDirective',dealIhostDirective);
export default router;
