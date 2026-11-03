import { GrievanceCategory } from '../types/janaseva';

export const DASHBOARD_BG_IMAGE = '/assets/aistudio/dashboard_image_009c981b.png';

export interface DepartmentVisualAsset {
  category: GrievanceCategory | string;
  departmentId: string;
  departmentName: string;
  motto: string;
  bannerImage: string;
  thumbnailImage: string;
  galleryImages: { src: string; caption: string }[];
}

export const DEPARTMENT_VISUAL_ASSETS: Record<string, DepartmentVisualAsset> = {
  'Water Supply': {
    category: 'Water Supply',
    departmentId: 'DEPT-WATER-01',
    departmentName: 'Water Supply Department',
    motto: 'Water Availability & Distribution',
    bannerImage: '/assets/aistudio/water_supply_management_b879ca86.jpeg',
    thumbnailImage: '/assets/aistudio/water_supply_management_b879ca86.jpeg',
    galleryImages: [
      {
        src: '/assets/aistudio/water_supply_management_b879ca86.jpeg',
        caption: 'Hyderabad Water Supply Reservoir & Distribution Pipeline Network',
      },
      {
        src: '/assets/aistudio/water_tap_acdcdefd.jpeg',
        caption: 'Domestic Tap Water Pressure & Supply Inspection',
      },
    ],
  },
  'Roads and Potholes': {
    category: 'Roads and Potholes',
    departmentId: 'DEPT-MUNI-02',
    departmentName: 'Municipal Engineering',
    motto: 'Building Better Roads',
    bannerImage: '/assets/aistudio/roads_and_muncipal_department_4893342e.jpeg',
    thumbnailImage: '/assets/aistudio/roads_and_muncipal_department_4893342e.jpeg',
    galleryImages: [
      {
        src: '/assets/aistudio/roads_and_muncipal_department_4893342e.jpeg',
        caption: 'Roads & Municipal Engineering Arterial Corridor',
      },
      {
        src: '/assets/aistudio/ROAD_2_6afe2701.jpeg',
        caption: 'Urban Flyover & Elevated Corridor Resurfacing',
      },
      {
        src: '/assets/aistudio/ROAD_11b5266a.jpeg',
        caption: 'GHMC Central Median & Avenue Road Maintenance',
      },
      {
        src: '/assets/aistudio/ROAD_TRANSPORT_62b207b4.jpeg',
        caption: 'High-Capacity Multi-Lane Express Corridor',
      },
      {
        src: '/assets/aistudio/ROAD_SAFETY_9db8113b.jpeg',
        caption: 'Cloverleaf Interchange & Highway Engineering',
      },
    ],
  },
  'Garbage Collection': {
    category: 'Garbage Collection',
    departmentId: 'DEPT-SANI-03',
    departmentName: 'Sanitation Department',
    motto: 'Clean City, Healthy Citizens',
    bannerImage: '/assets/aistudio/sanitization_department__824755e3.jpeg',
    thumbnailImage: '/assets/aistudio/sanitization_department__824755e3.jpeg',
    galleryImages: [
      {
        src: '/assets/aistudio/sanitization_department__824755e3.jpeg',
        caption: 'Hyderabad Clean & Green Door-to-Door Waste Collection',
      },
      {
        src: '/assets/aistudio/SANITATION2_b31cbfef.jpeg',
        caption: 'Material Recovery & Solid Waste Segregation Facility',
      },
      {
        src: '/assets/aistudio/GHMC_SANITATION_75f53fb1.jpeg',
        caption: 'Public Park Sanitation & Urban Green Belt Maintenance',
      },
    ],
  },
  Electricity: {
    category: 'Electricity',
    departmentId: 'DEPT-ELEC-04',
    departmentName: 'Electricity Department',
    motto: 'Powering Every Home',
    bannerImage: '/assets/aistudio/electric_department_bc6d869a.jpeg',
    thumbnailImage: '/assets/aistudio/electric_department_bc6d869a.jpeg',
    galleryImages: [
      {
        src: '/assets/aistudio/electric_department_bc6d869a.jpeg',
        caption: 'High-Voltage Power Transmission Grid',
      },
      {
        src: '/assets/aistudio/ELECTRICITY_f501af19.jpeg',
        caption: 'Regional Electrical Substation & Transformer Yard',
      },
      {
        src: '/assets/aistudio/ELECTRICITY_DEPT_f3cf3799.jpeg',
        caption: 'Extra-High-Tension Transmission Towers',
      },
      {
        src: '/assets/aistudio/ELECTRIC_DEPT_971935d1.jpeg',
        caption: 'Distribution Switchgear & Circuit Breakers',
      },
    ],
  },
  Streetlights: {
    category: 'Streetlights',
    departmentId: 'DEPT-ELMT-05',
    departmentName: 'Electrical Maintenance',
    motto: 'Brighter Streets, Safer Nights',
    bannerImage: '/assets/aistudio/street_light_department_515bf2e8.jpeg',
    thumbnailImage: '/assets/aistudio/street_light_department_515bf2e8.jpeg',
    galleryImages: [
      {
        src: '/assets/aistudio/street_light_department_515bf2e8.jpeg',
        caption: 'Hyderabad Smart LED Streetlight Corridor',
      },
      {
        src: '/assets/aistudio/STREET_LIGHT_2_13921c1d.jpeg',
        caption: 'High-Lumen Energy-Efficient LED Street Luminaire',
      },
      {
        src: '/assets/aistudio/STREET_LIGHT_9be28d3f.jpeg',
        caption: 'Hussain Sagar & Necklace Road Night Illumination',
      },
    ],
  },
  Drainage: {
    category: 'Drainage',
    departmentId: 'DEPT-DRNG-06',
    departmentName: 'Drainage Department',
    motto: 'Better Drainage, Safer Communities',
    bannerImage: '/assets/aistudio/Urban_Drainage_Department_Banner_acd8aced.png',
    thumbnailImage: '/assets/aistudio/Urban_Drainage_Department_Banner_acd8aced.png',
    galleryImages: [
      {
        src: '/assets/aistudio/Urban_Drainage_Department_Banner_acd8aced.png',
        caption: 'Engineered Stormwater Channel & Flood Mitigation',
      },
      {
        src: '/assets/aistudio/DRAINAGE_DEPT_815bc42a.jpeg',
        caption: 'Trunk Sewer & Stormwater Conduit Installation',
      },
      {
        src: '/assets/aistudio/DRAINAGE_DEPT_2_b316f964.jpeg',
        caption: 'Underground Reinforced Concrete Drainage Pipeline',
      },
    ],
  },
  'Public Safety': {
    category: 'Public Safety',
    departmentId: 'DEPT-SAFE-07',
    departmentName: 'Relevant Civic Authority',
    motto: 'Your Safety, Our Priority',
    bannerImage: '/assets/aistudio/Hyderabad_Public_Safety_Patrol_262e32a5.png',
    thumbnailImage: '/assets/aistudio/Hyderabad_Public_Safety_Patrol_262e32a5.png',
    galleryImages: [
      {
        src: '/assets/aistudio/Hyderabad_Public_Safety_Patrol_262e32a5.png',
        caption: 'Hyderabad Civic & Public Safety Patrol Unit',
      },
      {
        src: '/assets/aistudio/PUBLIC_SAFETY_991a7413.jpeg',
        caption: 'Hyderabad City Police Neighborhood Beat Officer',
      },
      {
        src: '/assets/aistudio/DISASTER_MANAGEMENT_DEPT_a176294d.jpeg',
        caption: 'GHMC Disaster Response Force (DRF) Emergency Fleet',
      },
      {
        src: '/assets/aistudio/PUBLIC_SAFETY_DEPT_fdd099fe.jpeg',
        caption: 'Traffic & Arterial Corridor Safety Enforcement',
      },
      {
        src: '/assets/aistudio/SANITATION_93d39e9c.jpeg',
        caption: 'Integrated Civic Command & Control Surveillance Center',
      },
      {
        src: '/assets/aistudio/HEALTH_DEPT_4ebe5532.jpeg',
        caption: '108 Emergency Medical Response Service',
      },
    ],
  },
};

const DEPT_NAME_LOOKUP: Record<string, DepartmentVisualAsset> = Object.values(
  DEPARTMENT_VISUAL_ASSETS
).reduce((acc, item) => {
  acc[item.departmentName.toLowerCase()] = item;
  acc[item.departmentId.toLowerCase()] = item;
  acc[item.category.toLowerCase()] = item;
  return acc;
}, {} as Record<string, DepartmentVisualAsset>);

export function getVisualAssetForDepartmentOrCategory(
  key?: string | null
): DepartmentVisualAsset {
  if (!key) return DEPARTMENT_VISUAL_ASSETS['Public Safety'];
  const normalized = key.trim().toLowerCase();
  if (DEPT_NAME_LOOKUP[normalized]) {
    return DEPT_NAME_LOOKUP[normalized];
  }
  if (normalized.includes('water')) return DEPARTMENT_VISUAL_ASSETS['Water Supply'];
  if (normalized.includes('road') || normalized.includes('muni')) {
    return DEPARTMENT_VISUAL_ASSETS['Roads and Potholes'];
  }
  if (normalized.includes('garb') || normalized.includes('sani')) {
    return DEPARTMENT_VISUAL_ASSETS['Garbage Collection'];
  }
  if (normalized.includes('street') || normalized.includes('maint')) {
    return DEPARTMENT_VISUAL_ASSETS['Streetlights'];
  }
  if (normalized.includes('elec')) return DEPARTMENT_VISUAL_ASSETS['Electricity'];
  if (normalized.includes('drain')) return DEPARTMENT_VISUAL_ASSETS['Drainage'];
  return DEPARTMENT_VISUAL_ASSETS['Public Safety'];
}
