"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge, { BadgeColor } from "@/components/ui/badge/Badge";

import { Project, ProjectPartner } from "../types";

interface ProjectsListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onViewDetails: (project: Project) => void;
  onAddPartner: (project: Project) => void;
  onEditPartner: (project: Project, partnerIndex: number) => void;
  onDeletePartner: (project: Project, partnerIndex: number) => void;
  onViewPartners: (project: Project) => void;
  formatPrice: (price: number, type: string) => string;
  getStatusColor: (status: string) => BadgeColor;
}

export default function ProjectsList({
  projects,
  onEdit,
  onDelete,
  onViewDetails,
  onAddPartner,
  onEditPartner,
  onDeletePartner,
  onViewPartners,
  formatPrice,
  getStatusColor,
}: ProjectsListProps) {
  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 w-[150px] max-w-[150px]"
            >
              Project Title
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Project Price
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Platform Fee
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Final Amount
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Platform Name
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Start Date
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              End Date
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Status
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Partners
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No projects found. Click "Add Project" to create one.
                  </TableCell>
                </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="py-3 w-[150px] max-w-[150px]">
                  <div
                    className="w-full"
                    title={project.projectTitle}
                  >
                    <button
                      onClick={() => onViewDetails(project)}
                      className="text-sm font-medium text-gray-800 dark:text-white/90 hover:text-brand-500 dark:hover:text-brand-400 block w-full text-left truncate"
                      title={project.projectTitle}
                    >
                      {project.projectTitle}
                    </button>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatPrice(project.projectPrice, project.priceType)}
                </TableCell>
                    <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                      {project.platformFeePercentage}% ({formatPrice(project.platformFeeAmount || 0, project.priceType)})
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {formatPrice(project.finalAmount || project.projectPrice, project.priceType)}
                      </p>
                    </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {project.platformName}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {project.projectStartDate}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  {project.projectEndDate || "-"}
                </TableCell>
                <TableCell className="py-3">
                  <Badge size="sm" color={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div 
                    className="cursor-pointer"
                    onClick={() => onViewPartners(project)}
                  >
                    <PartnersCell
                      project={project}
                      onAddPartner={onAddPartner}
                      onViewPartners={onViewPartners}
                    />
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(project)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      title="View Details"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(project)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      title="Edit"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(project)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Partners Cell Component
function PartnersCell({
  project,
  onAddPartner,
  onViewPartners,
}: {
  project: Project;
  onAddPartner: (project: Project) => void;
  onViewPartners: (project: Project) => void;
}) {
  const totalShare = project.partners.reduce((sum, p) => sum + p.sharePercentage, 0);
  const maxVisible = 1;
  const hasMorePartners = project.partners.length > maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {project.partners.length > 0 ? (
        <>
          {project.partners.slice(0, maxVisible).map((partner) => (
            <button
              key={partner.id}
              onClick={() => onViewPartners(project)}
              className="cursor-pointer hover:opacity-80"
            >
              <Badge
                size="sm"
                color="primary"
              >
                {partner.name} ({partner.sharePercentage}%)
              </Badge>
            </button>
          ))}
          {hasMorePartners && (
            <button
              onClick={() => onViewPartners(project)}
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title={`View all ${project.partners.length} partners`}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              +{project.partners.length - maxVisible}
            </button>
          )}
          {totalShare < 100 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({100 - totalShare}% remaining)
            </span>
          )}
        </>
      ) : (
        <span
          className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={() => onViewPartners(project)}
        >
          No partners
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddPartner(project);
        }}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-medium text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
        title="Add Partner"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export type { Project, ProjectPartner };

