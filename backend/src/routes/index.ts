import express from 'express';
import login from '@/services/login';
import getFamily from '@/services/getFamily';
import getFamilyThing from '@/services/getFamilyThing';
import integrateDevice from '@/services/integrateDevice';
import disIntegrateDevice from '@/services/disIntegrateDevice';
import getOpenToken from '@/services/getOpenToken';
import logout from '@/services/logout';
import sseBridge from '@/services/sseBridge';
import dealIhostDirective from '@/services/dealIhostDirective';
import updateDevice from '@/services/updateDevice';

const router = express.Router();

// ================================frontend=========================================
router.post('/login', login);
router.post('/logout',logout);
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
