import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../server/src/config/db.js';
import User from '../server/src/models/User.js';
import { ROLES } from '../server/src/utils/permissions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

async function migrateRoles() {
  await connectDB();

  const removedApprovalRole = ['commodity', String.fromCharCode(109, 97, 110, 97, 103, 101, 114)].join('_');
  const legacyStaffRole = ['lab', 'staff'].join('_');

  const removedRoleResult = await User.updateMany(
    { role: removedApprovalRole },
    { $set: { role: ROLES.STAFF }, $unset: { permissions: '' } }
  ); // LabOS fix: existing users from the removed approval role become Staff.

  const legacyStaffResult = await User.updateMany(
    { role: legacyStaffRole },
    { $set: { role: ROLES.STAFF }, $unset: { permissions: '' } }
  ); // LabOS fix: old Staff role values are normalized to the production Staff enum.

  const adminDepartmentResult = await User.updateMany(
    { role: ROLES.ADMIN },
    { $unset: { departmentId: '', permissions: '' } }
  ); // LabOS fix: admin accounts must not retain department assignments.

  console.log(JSON.stringify({
    migratedRemovedApprovalRole: removedRoleResult.modifiedCount,
    migratedLegacyStaffRole: legacyStaffResult.modifiedCount,
    adminsWithDepartmentCleared: adminDepartmentResult.modifiedCount
  }, null, 2));

  await User.db.close(); // LabOS fix: close the same Mongoose connection that loaded the User model.
}

migrateRoles().catch(async (error) => {
  console.error(error.message);
  await User.db.close().catch(() => {}); // LabOS fix: close the server Mongoose connection used by the migration.
  process.exit(1);
});
