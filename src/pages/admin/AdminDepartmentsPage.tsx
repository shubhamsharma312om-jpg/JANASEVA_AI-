import React, { useState } from 'react';
import { Building2, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DepartmentRecord } from '../../types/janaseva';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';

export const AdminDepartmentsPage: React.FC = () => {
  const {
    departments,
    grievances,
    toggleDepartmentActive,
    updateDepartmentDetails,
    addNewDepartment,
  } = useApp();

  const [selectedDept, setSelectedDept] = useState<DepartmentRecord | null>(
    null
  );
  const [editSla, setEditSla] = useState<number>(24);
  const [editDesc, setEditDesc] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptId, setNewDeptId] = useState('DEPT-PARKS-08');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCategory, setNewDeptCategory] = useState('');
  const [newDeptSla, setNewDeptSla] = useState(48);
  const [newDeptDesc, setNewDeptDesc] = useState('');

  const handleInspect = (dept: DepartmentRecord) => {
    setSelectedDept(dept);
    setEditSla(dept.default_sla_hours);
    setEditDesc(dept.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    updateDepartmentDetails(selectedDept.department_id, {
      default_sla_hours: Number(editSla) || 24,
      description: editDesc.trim(),
    });
    setSelectedDept(null);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCategory.trim()) return;
    addNewDepartment({
      department_id: newDeptId.trim().toUpperCase(),
      department_name: newDeptName.trim(),
      supported_categories: [newDeptCategory.trim()],
      is_active: true,
      default_sla_hours: Number(newDeptSla) || 48,
      description:
        newDeptDesc.trim() || 'Demonstration municipal department unit.',
    });
    setShowAddModal(false);
    setNewDeptName('');
    setNewDeptCategory('');
    setNewDeptDesc('');
  };

  const selectedVisual = selectedDept
    ? getVisualAssetForDepartmentOrCategory(
        selectedDept.department_name ||
          selectedDept.supported_categories[0] ||
          selectedDept.department_id
      )
    : null;

  return (
    <div className="space-y-8">
      {/* Department Visual Cards Grid with Uploaded 16:9 Thumbnails */}
      <section className="space-y-4">
        <div className="jana-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#102A56]">
              Municipal Departments &amp; Category Mapping
            </h1>
            <p className="text-xs text-[#63718A] mt-0.5">
              Preserves the 7 Phase 1 demonstration departments
              (`backend/app/core/department_mapping.json`) seeded in SQLite,
              paired with their official visual banners and infrastructure
              galleries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="jana-btn-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Demo Department</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const assignedCount = grievances.filter(
              (g) => g.assigned_department === dept.department_name
            ).length;
            const visualAsset = getVisualAssetForDepartmentOrCategory(
              dept.department_name ||
                dept.supported_categories[0] ||
                dept.department_id
            );

            return (
              <div
                key={dept.department_id}
                className="jana-card jana-card-interactive overflow-hidden flex flex-col justify-between group"
              >
                {/* 16:9 Uploaded Department Banner Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-sky-200/70">
                  <img
                    src={visualAsset.bannerImage}
                    alt={dept.department_name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-semibold text-[#63718A]">
                        {dept.department_id}
                      </span>
                      <span
                        className={
                          dept.is_active
                            ? 'text-emerald-700 font-semibold'
                            : 'text-slate-400 font-semibold'
                        }
                      >
                        {dept.is_active ? 'Active' : 'Inactive'} ·{' '}
                        {dept.default_sla_hours}h SLA
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#102A56]">
                      {dept.department_name}
                    </h2>
                    <div className="text-xs font-medium text-[#1D4ED8] mt-0.5">
                      Categories: {dept.supported_categories.join(', ')}
                    </div>
                    <p className="text-xs text-[#63718A] mt-2 leading-relaxed line-clamp-2">
                      {dept.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#63718A]">Assigned: </span>
                      <span className="font-mono font-bold text-[#102A56]">
                        {assignedCount} tickets
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInspect(dept)}
                        className="jana-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Inspect &amp; Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleDepartmentActive(dept.department_id)
                        }
                        className="px-2.5 py-1.5 text-xs font-medium text-[#63718A] hover:text-[#102A56] cursor-pointer"
                      >
                        {dept.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabular Department Routing Registry */}
      <section className="jana-card p-6">
        <h2 className="text-base font-bold text-[#102A56] mb-4">
          Department Routing Table Registry
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-200/70 text-xs text-[#63718A]">
                <th className="py-3 pr-4">Department ID</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Supported Categories</th>
                <th className="py-3 px-4 text-right">Target SLA</th>
                <th className="py-3 px-4 text-right">Assigned Complaints</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {departments.map((dept) => {
                const assignedCount = grievances.filter(
                  (g) => g.assigned_department === dept.department_name
                ).length;

                return (
                  <tr
                    key={dept.department_id}
                    className="hover:bg-sky-50/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4 font-mono font-semibold text-[#102A56] whitespace-nowrap">
                      {dept.department_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#102A56] whitespace-nowrap">
                      {dept.department_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#63718A]">
                      {dept.supported_categories.join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums text-[#102A56] whitespace-nowrap">
                      {dept.default_sla_hours}h
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-right tabular-nums text-[#1D4ED8] whitespace-nowrap">
                      {assignedCount}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={
                          dept.is_active
                            ? 'text-emerald-700 font-semibold'
                            : 'text-slate-400 font-semibold'
                        }
                      >
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => handleInspect(dept)}
                        className="px-3 py-1.5 font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                      >
                        View / Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleDepartmentActive(dept.department_id)
                        }
                        className="jana-btn-secondary px-3 py-1.5 font-medium rounded-lg cursor-pointer"
                      >
                        {dept.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* View / Edit Department Modal with Uploaded Banner & Infrastructure Gallery */}
      {selectedDept && selectedVisual && (
        <div className="fixed inset-0 z-50 bg-[#102A56]/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="jana-card max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-sky-200/70 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1D4ED8]" />
                <h2 className="text-base font-bold text-[#102A56]">
                  {selectedDept.department_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="p-1 text-[#63718A] hover:text-[#102A56] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department Main Banner & Supporting Infrastructure Gallery */}
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-sky-200/80 bg-slate-900">
                <img
                  src={selectedVisual.bannerImage}
                  alt={selectedDept.department_name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {selectedVisual.galleryImages.length > 1 && (
                <div>
                  <div className="text-xs font-semibold text-[#102A56] mb-2">
                    Department Field Operations &amp; Civic Infrastructure
                    Photos ({selectedVisual.galleryImages.length} Assets)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedVisual.galleryImages.map((img) => (
                      <div
                        key={img.src}
                        className="rounded-lg overflow-hidden border border-sky-200/80 bg-[#FFFCF7]"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-slate-900">
                          <img
                            src={img.src}
                            alt={img.caption}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="p-1.5 text-[10px] text-[#63718A] truncate">
                          {img.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[#63718A]">Department ID</div>
                  <div className="font-mono font-semibold text-[#102A56] mt-0.5">
                    {selectedDept.department_id}
                  </div>
                </div>
                <div>
                  <div className="text-[#63718A]">Supported Categories</div>
                  <div className="font-semibold text-[#102A56] mt-0.5">
                    {selectedDept.supported_categories.join(', ')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#102A56] mb-1">
                  Target SLA (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={editSla}
                  onChange={(e) => setEditSla(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#102A56] mb-1">
                  Civic Scope Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="jana-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="jana-btn-primary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Demo Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#102A56]/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="jana-card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-200/70 pb-3">
              <h2 className="text-base font-bold text-[#102A56]">
                Add Demonstration Department
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#63718A] hover:text-[#102A56] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#102A56] mb-1">
                  Department ID *
                </label>
                <input
                  type="text"
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#102A56] mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g., Urban Biodiversity & Parks"
                  className="w-full px-3 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#102A56] mb-1">
                  Supported Category *
                </label>
                <input
                  type="text"
                  value={newDeptCategory}
                  onChange={(e) => setNewDeptCategory(e.target.value)}
                  placeholder="e.g., Parks and Tree Maintenance"
                  className="w-full px-3 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#102A56] mb-1">
                  Target SLA (Hours)
                </label>
                <input
                  type="number"
                  value={newDeptSla}
                  onChange={(e) => setNewDeptSla(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#102A56] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="jana-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="jana-btn-accent px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
