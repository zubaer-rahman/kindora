/* eslint-disable @typescript-eslint/no-explicit-any */
import Skill from '../db/models/skill';
import { AppError } from '../lib/errors.js';
import {
  CreateSkillInput,
  GetSkillsQuery,
  IncrementUsageInput,
  GetForMultiSelectQuery,
} from '../validators/skill.validator.js';

// Cast model to avoid Mongoose union-type generic issues with .find() overloads
const SkillModel = Skill as any;

export async function getAllSkills(input: GetSkillsQuery) {
  const { search, limit } = input;

  let query = {};
  if (search) {
    query = {
      name: { $regex: search, $options: 'i' },
    };
  }

  const skills = await SkillModel.find(query)
    .sort({ usage_count: -1, name: 1 })
    .limit(limit);

  return {
    success: true,
    data: skills,
  };
}

export async function createSkill(userId: string, input: CreateSkillInput) {
  if (!userId) {
    throw new AppError(401, 'User must be logged in to create skills');
  }

  const trimmedName = input.name.trim();

  const existingSkill = await SkillModel.findOne({
    name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
  });

  if (existingSkill) {
    return {
      success: true,
      data: existingSkill,
      message: 'Skill already exists, returning existing skill',
    };
  }

  const skill = new SkillModel({
    name: trimmedName,
    is_custom: true,
    created_by: userId,
    usage_count: 0,
  });

  await skill.save();

  return {
    success: true,
    data: skill,
  };
}

export async function incrementUsage(input: IncrementUsageInput) {
  const { skillIds } = input;

  await SkillModel.updateMany(
    { _id: { $in: skillIds } },
    { $inc: { usage_count: 1 } },
  );

  return {
    success: true,
    message: 'Usage count updated',
  };
}

export async function initializePredefined() {
  const existingSkills = await SkillModel.find({ is_custom: false });

  if (existingSkills.length > 0) {
    return {
      success: true,
      message: 'Predefined skills already initialized',
      count: existingSkills.length,
    };
  }

  const predefinedSkills = SKILL_OPTIONS.map(skill => ({
    name: skill.value,
    is_custom: false,
    usage_count: 0,
  }));

  try {
    await SkillModel.insertMany(predefinedSkills, { ordered: false });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code !== 11000) {
      throw error;
    }
  }

  const finalCount = await SkillModel.countDocuments({ is_custom: false });

  return {
    success: true,
    message: 'Predefined skills initialized',
    count: finalCount,
  };
}

export async function getForMultiSelect(input: GetForMultiSelectQuery) {
  const { search, limit } = input;

  let query = {};
  if (search) {
    query = {
      name: { $regex: search, $options: 'i' },
    };
  }

  const skills = await SkillModel.find(query)
    .sort({ createdAt: -1, usage_count: -1, name: 1 })
    .limit(limit);

  const uniqueSkills = new Map<string, (typeof skills)[0]>();
  skills.forEach(skill => {
    const normalizedName = skill.name.toLowerCase();
    if (!uniqueSkills.has(normalizedName)) {
      uniqueSkills.set(normalizedName, skill);
    }
  });

  const options = Array.from(uniqueSkills.values()).map(skill => ({
    value: skill.name,
    label: skill.name,
  }));

  return {
    success: true,
    data: options,
  };
}

const SKILL_OPTIONS = [
  { value: 'Communication', label: 'Communication' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Teamwork', label: 'Teamwork' },
  { value: 'Problem Solving', label: 'Problem Solving' },
  { value: 'Time Management', label: 'Time Management' },
  { value: 'Adaptability', label: 'Adaptability' },
  { value: 'Creativity', label: 'Creativity' },
  { value: 'Critical Thinking', label: 'Critical Thinking' },
  { value: 'Conflict Resolution', label: 'Conflict Resolution' },
  { value: 'Decision Making', label: 'Decision Making' },
  { value: 'Emotional Intelligence', label: 'Emotional Intelligence' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Stress Management', label: 'Stress Management' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Work Ethic', label: 'Work Ethic' },
  { value: 'Attention to Detail', label: 'Attention to Detail' },
  { value: 'Active Listening', label: 'Active Listening' },
  { value: 'Interpersonal Skills', label: 'Interpersonal Skills' },
  { value: 'Empathy', label: 'Empathy' },
  { value: 'Collaboration', label: 'Collaboration' },
];
